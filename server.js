// AUREN Content Studio — local Express server + JSON API.
// Runs entirely on your machine. No auth (single local user), no telemetry.

import './src/loadEnv.js'; // must be first: loads .env into process.env
import express from 'express';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { PORT, PATHS, VIDEO, COLOR_SWATCHES } from './src/config.js';
import { PILLAR_KEYS, PILLARS } from './src/generator/library.js';
import { TEMPLATE_KEYS, buildScenes } from './src/render/templates.js';
import { listFonts } from './src/render/fonts.js';
import { SIZE_KEYS, WEIGHT_KEYS, renderSceneToPng } from './src/render/frame.js';
import fsp from 'node:fs/promises';
import { LocalContentGenerator } from './src/generator/LocalContentGenerator.js';
import { FFmpegReelRenderer } from './src/render/FFmpegReelRenderer.js';
import { MockInstagramPublisher } from './src/publish/MockInstagramPublisher.js';
import { RealInstagramPublisher } from './src/publish/RealInstagramPublisher.js';
import { startTunnel } from './src/publish/tunnel.js';
import { uploadToR2, r2Configured } from './src/publish/r2.js';
import { searchTracks, downloadTrack, jamendoConfigured } from './src/music/jamendo.js';
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
// Serve the dashboard with no caching so CSS/JS edits always load fresh
// (this is a local dev tool — correctness over cache efficiency).
app.use(express.static(path.join(__dirname, 'public'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => res.set('Cache-Control', 'no-store'),
}));
// Serve rendered videos for in-dashboard preview. No-store so re-renders
// (same filename) always show the newest MP4, never a cached older one.
app.use('/media', express.static(PATHS.content, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => res.set('Cache-Control', 'no-store'),
}));

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
    musicEnabled: jamendoConfigured(), // true => music search available
    motions: ['subtle', 'still'],
    // Phone-reachable base URL (same Wi-Fi) for the "Send to Phone" QR.
    lanBaseUrl: lanIP() ? `http://${lanIP()}:${PORT}` : null,
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

// ---- Live still-frame preview (fast; no FFmpeg) ----
// Renders ONE PNG of the reel's key scene from proposed (unsaved) editor values,
// so the dashboard can show design changes instantly without a full re-render.
app.post('/api/preview', wrap(async (req, res) => {
  const settings = await store.getSettings();
  const item = req.body || {};
  const scenes = buildScenes(item, settings);
  // Pick the most representative scene: the one with the most text lines.
  const scene = scenes.slice().sort((a, b) =>
    (b.lines?.length || 0) - (a.lines?.length || 0))[0] || scenes[0];

  const frameOpts = {
    fontKey: item.font || settings?.brand?.font || 'serif',
    footer: {
      show: item.showBioFooter !== false,
      text: item.bioFooterText || settings?.brand?.bioFooterText || 'link in bio',
    },
    styleOverrides: item.styleOverrides || {},
  };

  const tmp = path.join(await fsp.mkdtemp(path.join(os.tmpdir(), 'auren-prev-')), 'p.png');
  await renderSceneToPng(scene, item.background || 'midnight', tmp, frameOpts);
  const buf = await fsp.readFile(tmp);
  fsp.rm(path.dirname(tmp), { recursive: true, force: true }).catch(() => {});
  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'no-store');
  res.send(buf);
}));

// ---- Music search (Jamendo, royalty-free / Creative Commons) ----
app.get('/api/music/search', wrap(async (req, res) => {
  if (!jamendoConfigured()) {
    return res.status(400).json({ error: 'Music search not configured. Add JAMENDO_CLIENT_ID to .env.' });
  }
  const q = req.query.q || '';
  const tracks = await searchTracks(q, { limit: 20 });
  res.json({ tracks });
}));

// ---- Generate 7 (or N) Reels ----
app.post('/api/generate', wrap(async (req, res) => {
  const settings = await store.getSettings();
  const count = Number(req.body?.count) || 7;
  const pillar = req.body?.pillar || null; // null/"" => mixed week by distribution
  // Concepts already in the queue, so we don't regenerate the same ones.
  const existing = await store.getItems();
  const usedConceptIds = existing.map((i) => i.conceptId).filter(Boolean);
  const items = await generator.generate({
    count,
    distribution: settings.distribution,
    settings,
    startDate: new Date(),
    pillar,
    usedConceptIds,
  });
  // Append to the existing queue (don't wipe prior work).
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
    'durationSec', 'font', 'showBioFooter', 'bioFooterText', 'styleOverrides',
    'motion', 'audio'];
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

  // If a music track is attached, download it to a temp file for muxing.
  let audioTmpDir = null;
  if (item.audio && item.audio.audio) {
    audioTmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'auren-audio-'));
    const audioFile = path.join(audioTmpDir, 'track.mp3');
    await downloadTrack(item.audio.audio, audioFile);
    item.audioFilePath = audioFile;
  }

  try {
    const { videoFile } = await renderer.render(item, settings);
    const next = { ...item, videoFile, status: 'RENDERED' };
    delete next.audioFilePath; // don't persist the temp path
    await store.upsertItem(next);
    res.json(next);
  } finally {
    if (audioTmpDir) fsp.rm(audioTmpDir, { recursive: true, force: true }).catch(() => {});
  }
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
  // Allow the caller to supply a public video URL at post time (overrides tunnel).
  if (req.body?.publicVideoUrl) item.publicVideoUrl = req.body.publicVideoUrl;

  const events = [];
  let tunnel = null;
  try {
    // For live posting, Instagram must fetch the MP4 from a public URL.
    // Prefer R2 (works behind corporate networks); fall back to a cloudflared tunnel.
    if (HAS_IG_CREDS && !item.publicVideoUrl) {
      if (r2Configured()) {
        events.push({ stage: 'UPLOAD_R2', detail: 'Uploading video to Cloudflare R2…' });
        const abs = path.join(PATHS.content, item.videoFile);
        item.publicVideoUrl = await uploadToR2(abs, item.videoFile);
        events.push({ stage: 'UPLOAD_R2', detail: 'Uploaded. Public URL ready.' });
      } else {
        events.push({ stage: 'TUNNEL', detail: 'Opening a temporary public link for the video…' });
        tunnel = await startTunnel(PORT);
        item.publicVideoUrl = `${tunnel.url}/media/${item.videoFile}`;
      }
    }

    const result = await publisher.publishReel(item, (stage, detail) => events.push({ stage, detail }));
    const next = { ...item, status: 'PUBLISHED', publish: result };
    // Don't persist the ephemeral tunnel URL.
    delete next.publicVideoUrl;
    await store.upsertItem(next);
    res.json({ item: next, events, result, live: HAS_IG_CREDS });
  } finally {
    if (tunnel) tunnel.stop();
  }
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
