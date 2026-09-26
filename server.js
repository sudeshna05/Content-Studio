// AUREN Content Studio — local Express server + JSON API.
// Runs entirely on your machine. No auth (single local user), no telemetry.

import express from 'express';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { PORT, PATHS, VIDEO, COLOR_SWATCHES } from './src/config.js';
import { PILLAR_KEYS, PILLARS } from './src/generator/library.js';
import { TEMPLATE_KEYS } from './src/render/templates.js';
import { listFonts } from './src/render/fonts.js';
import { SIZE_KEYS, WEIGHT_KEYS } from './src/render/frame.js';
import { LocalContentGenerator } from './src/generator/LocalContentGenerator.js';
import { FFmpegReelRenderer } from './src/render/FFmpegReelRenderer.js';
import { MockInstagramPublisher } from './src/publish/MockInstagramPublisher.js';
import { RealInstagramPublisher } from './src/publish/RealInstagramPublisher.js';
import { buildCaption } from './src/caption/captionBuilder.js';
import { upcoming, byWeekday } from './src/schedule/scheduler.js';
import * as store from './src/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const generator = new LocalContentGenerator();
const renderer = new FFmpegReelRenderer();

// Use the REAL publisher when credentials are present; otherwise mock so the
// UI still works safely. `live` tells the frontend which one is active.
const HAS_IG_CREDS = !!(process.env.IG_BUSINESS_ACCOUNT_ID && process.env.IG_ACCESS_TOKEN);
const publisher = HAS_IG_CREDS ? new RealInstagramPublisher() : new MockInstagramPublisher();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
// Serve rendered videos for in-dashboard preview.
app.use('/media', express.static(PATHS.content));

const wrap = (fn) => (req, res) =>
  Promise.resolve(fn(req, res)).catch((err) => {
    console.error('[api]', err.message);
    res.status(500).json({ error: err.message });
  });

// ---- Meta / config ----
app.get('/api/meta', wrap(async (_req, res) => {
  const settings = await store.getSettings();
  res.json({
    pillars: PILLAR_KEYS.map((k) => ({ key: k, label: PILLARS[k].label })),
    templates: TEMPLATE_KEYS,
    backgrounds: ['midnight', 'moonlit'],
    fonts: listFonts(),
    colorSwatches: COLOR_SWATCHES.map((s) => ({ key: s.key, label: s.label })),
    sections: ['hook', 'body', 'cta', 'footer'],
    sizes: SIZE_KEYS,
    weights: WEIGHT_KEYS,
    publishLive: HAS_IG_CREDS, // true => "Post Now" really posts to Instagram
    settings,
    video: VIDEO,
  });
}));

app.get('/api/settings', wrap(async (_req, res) => res.json(await store.getSettings())));
app.put('/api/settings', wrap(async (req, res) => res.json(await store.saveSettings(req.body || {}))));

// ---- Content listing (with schedule views) ----
app.get('/api/content', wrap(async (_req, res) => {
  const items = await store.getItems();
  res.json({ items, upcoming: upcoming(items), week: byWeekday(items) });
}));

app.get('/api/content/:id', wrap(async (req, res) => {
  const item = await store.getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'not found' });
  res.json(item);
}));

// ---- Generate 7 (or N) Reels ----
app.post('/api/generate', wrap(async (req, res) => {
  const settings = await store.getSettings();
  const count = Number(req.body?.count) || 7;
  const pillar = req.body?.pillar || null; // null/"" => mixed week by distribution
  const items = await generator.generate({
    count,
    distribution: settings.distribution,
    settings,
    startDate: new Date(),
    pillar,
  });
  // Append to the existing queue (don't wipe prior work).
  const existing = await store.getItems();
  await store.saveItems([...existing, ...items]);
  // When a single pillar has fewer distinct concepts than requested, we return
  // fewer items rather than repeating — tell the UI so it can note it.
  res.json({ added: items.length, requested: count, pillar, items });
}));

// ---- Edit / save an item ----
app.put('/api/content/:id', wrap(async (req, res) => {
  const settings = await store.getSettings();
  const current = await store.getItem(req.params.id);
  if (!current) return res.status(404).json({ error: 'not found' });

  const editable = ['hook', 'body', 'cta', 'caption', 'hashtags', 'pillar',
    'scheduledDate', 'scheduledTime', 'template', 'background', 'concept',
    'durationSec', 'font', 'showBioFooter', 'bioFooterText', 'styleOverrides'];
  const next = { ...current };
  for (const k of editable) if (k in (req.body || {})) next[k] = req.body[k];

  // If the caption wasn't explicitly edited but copy changed, offer a rebuild.
  if (req.body?.rebuildCaption) {
    next.caption = buildCaption(
      { caption: req.body.captionBase ?? current.caption, hashtags: next.hashtags, cta: next.cta },
      settings
    );
  }
  await store.upsertItem(next);
  res.json(next);
}));

app.delete('/api/content/:id', wrap(async (req, res) => {
  await store.deleteItem(req.params.id);
  res.json({ ok: true });
}));

// ---- Render a Reel ----
app.post('/api/content/:id/render', wrap(async (req, res) => {
  const settings = await store.getSettings();
  const item = await store.getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'not found' });

  const { videoFile } = await renderer.render(item, settings);
  const next = { ...item, videoFile, status: 'RENDERED' };
  await store.upsertItem(next);
  res.json(next);
}));

// ---- Approve ----
app.post('/api/content/:id/approve', wrap(async (req, res) => {
  const item = await store.getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'not found' });
  if (item.status !== 'RENDERED' && item.status !== 'APPROVED') {
    return res.status(400).json({ error: 'Only RENDERED items can be approved.' });
  }
  const next = { ...item, status: 'APPROVED' };
  await store.upsertItem(next);
  res.json(next);
}));

// ---- Schedule (mark SCHEDULED; still not published) ----
app.post('/api/content/:id/schedule', wrap(async (req, res) => {
  const item = await store.getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'not found' });
  if (item.status !== 'APPROVED' && item.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'Only APPROVED items can be scheduled.' });
  }
  const next = {
    ...item,
    status: 'SCHEDULED',
    scheduledDate: req.body?.scheduledDate ?? item.scheduledDate,
    scheduledTime: req.body?.scheduledTime ?? item.scheduledTime,
  };
  await store.upsertItem(next);
  res.json(next);
}));

// ---- Publish / Post Now ----
// Real when IG credentials are set, otherwise mock. Requires APPROVED and a
// rendered video. When live, item.publicVideoUrl must be set (see setup guide).
app.post('/api/content/:id/publish', wrap(async (req, res) => {
  const item = await store.getItem(req.params.id);
  if (!item) return res.status(404).json({ error: 'not found' });
  if (item.status !== 'APPROVED' && item.status !== 'SCHEDULED') {
    return res.status(400).json({ error: 'Only APPROVED (or SCHEDULED) reels can be posted.' });
  }
  if (!item.videoFile) {
    return res.status(400).json({ error: 'Render the reel before posting.' });
  }
  // Allow the caller to supply a public video URL at post time (for live posting).
  if (req.body?.publicVideoUrl) item.publicVideoUrl = req.body.publicVideoUrl;

  const events = [];
  const result = await publisher.publishReel(item, (stage, detail) => events.push({ stage, detail }));
  const next = { ...item, status: 'PUBLISHED', publish: result };
  await store.upsertItem(next);
  res.json({ item: next, events, result, live: HAS_IG_CREDS });
}));

// Find this Mac's LAN IP so you can open the studio from your phone
// (same Wi-Fi). Express binds to 0.0.0.0 by default, so this just works.
function lanIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return null;
}

app.listen(PORT, () => {
  const ip = lanIP();
  console.log(`\n  AUREN CONTENT STUDIO`);
  console.log(`  on this Mac   http://localhost:${PORT}`);
  if (ip) console.log(`  on your phone http://${ip}:${PORT}   (same Wi-Fi)`);
  console.log(`  (local only · nothing is published · $0)\n`);
});
