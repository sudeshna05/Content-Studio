// AUREN Content Studio — dashboard client. Vanilla JS, no build step.

const $ = (s) => document.querySelector(s);
const api = async (url, opts) => {
  const r = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || r.statusText);
  return data;
};

let META = null;
let CURRENT = null; // item open in editor

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

function opt(sel, values, current, labels) {
  sel.innerHTML = '';
  values.forEach((v, i) => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = labels ? labels[i] : v;
    if (v === current) o.selected = true;
    sel.appendChild(o);
  });
}

function cardEl(item) {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="concept">
      <div class="hook">${escapeHtml(item.hook || item.concept || '')}</div>
      <div class="meta">
        <span class="pill status ${item.status}">${item.status}</span>
        <span class="pill">${escapeHtml(item.pillarLabel || item.pillar)}</span>
        <span class="pill">${item.template}</span>
        <span class="pill">${item.scheduledDate || 'unscheduled'} ${item.scheduledTime || ''}</span>
        ${item.videoFile ? '<span class="pill">🎬 rendered</span>' : ''}
      </div>
    </div>
    <div class="card-actions">
      <button data-act="open">Open</button>
      ${!item.videoFile ? '<button data-act="render">Render</button>' : '<button data-act="render">Re-render</button>'}
      ${item.status === 'RENDERED' ? '<button data-act="approve">Approve</button>' : ''}
    </div>`;
  el.querySelector('[data-act="open"]').onclick = () => openEditor(item.id);
  const rb = el.querySelector('[data-act="render"]');
  if (rb) rb.onclick = () => renderItem(item.id);
  const ab = el.querySelector('[data-act="approve"]');
  if (ab) ab.onclick = () => approveItem(item.id);
  return el;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

async function load() {
  META = await api('/api/meta');

  // Populate the generate-type dropdown once.
  const gp = $('#gen-pillar');
  if (gp && !gp.dataset.ready) {
    const o0 = document.createElement('option');
    o0.value = '';
    o0.textContent = 'All pillars (mixed week)';
    gp.appendChild(o0);
    META.pillars.forEach((p) => {
      const o = document.createElement('option');
      o.value = p.key;
      o.textContent = p.label;
      gp.appendChild(o);
    });
    gp.dataset.ready = '1';
  }

  const { items, upcoming, week } = await api('/api/content');

  // Upcoming
  const up = $('#upcoming');
  up.innerHTML = '';
  if (!upcoming.length) up.innerHTML = '<div class="empty">nothing scheduled yet</div>';
  upcoming.slice(0, 6).forEach((it) => up.appendChild(cardEl(it)));

  // Weekly queue
  const wk = $('#week');
  wk.innerHTML = '';
  week.order.forEach((day) => {
    const d = document.createElement('div');
    d.className = 'day';
    const body = week.groups[day].map(() => '').join('');
    d.innerHTML = `<div class="day-h">${day.toUpperCase()}</div><div class="day-body"></div>`;
    const bodyEl = d.querySelector('.day-body');
    if (!week.groups[day].length) bodyEl.innerHTML = '<div class="empty">—</div>';
    week.groups[day].forEach((it) => bodyEl.appendChild(cardEl(it)));
    wk.appendChild(d);
  });
}

async function generate() {
  $('#btn-generate').disabled = true;
  try {
    const pillar = $('#gen-pillar').value || null;
    const count = Number($('#gen-count').value) || 7;
    const r = await api('/api/generate', { method: 'POST', body: { count, pillar } });
    if (r.added < r.requested) {
      toast(`Generated ${r.added} (only ${r.added} distinct ideas available)`);
    } else {
      toast(`Generated ${r.added} reels`);
    }
    await load();
  } catch (e) { toast(e.message); }
  $('#btn-generate').disabled = false;
}

async function renderItem(id) {
  toast('Rendering… (a few seconds)');
  try {
    await api(`/api/content/${id}/render`, { method: 'POST' });
    toast('Rendered ✓');
    if (CURRENT && CURRENT.id === id) await openEditor(id);
    await load();
  } catch (e) { toast(e.message); }
}

async function approveItem(id) {
  try {
    await api(`/api/content/${id}/approve`, { method: 'POST' });
    toast('Approved ✓');
    if (CURRENT && CURRENT.id === id) await openEditor(id);
    await load();
  } catch (e) { toast(e.message); }
}

// Build the per-section font+color rows. Each row = hook/body/cta/footer.
const SECTION_LABELS = { hook: 'Hook', body: 'Body', cta: 'CTA', footer: 'Footer' };
function buildSectionStyles(overrides = {}) {
  const wrap = $('#section-styles');
  wrap.innerHTML = '';
  const fontOpts = [{ key: '', label: 'font' }, ...(META.fonts || [])];
  const colorOpts = [{ key: '', label: 'color' }, ...(META.colorSwatches || [])];
  const sizeOpts = [{ key: '', label: 'size' }, ...((META.sizes || []).map((s) => ({ key: s, label: s.toUpperCase() })))];
  const weightOpts = [{ key: '', label: 'weight' }, ...((META.weights || []).map((w) => ({ key: w, label: w })))];
  (META.sections || ['hook', 'body', 'cta', 'footer']).forEach((sec) => {
    const ov = overrides[sec] || {};
    const row = document.createElement('div');
    row.className = 'section-row';
    row.innerHTML = `
      <div class="name">${SECTION_LABELS[sec] || sec}</div>
      <select data-sec="${sec}" data-kind="font"></select>
      <select data-sec="${sec}" data-kind="color"></select>
      <select data-sec="${sec}" data-kind="size"></select>
      <select data-sec="${sec}" data-kind="weight"></select>`;
    wrap.appendChild(row);
    opt(row.querySelector('[data-kind="font"]'), fontOpts.map((f) => f.key), ov.font || '', fontOpts.map((f) => f.label));
    opt(row.querySelector('[data-kind="color"]'), colorOpts.map((c) => c.key), ov.color || '', colorOpts.map((c) => c.label));
    opt(row.querySelector('[data-kind="size"]'), sizeOpts.map((s) => s.key), ov.size || '', sizeOpts.map((s) => s.label));
    opt(row.querySelector('[data-kind="weight"]'), weightOpts.map((w) => w.key), ov.weight || '', weightOpts.map((w) => w.label));
  });
}

function collectSectionStyles() {
  const out = {};
  document.querySelectorAll('#section-styles .section-row').forEach((row) => {
    const sec = row.querySelector('select').dataset.sec;
    const entry = {};
    ['font', 'color', 'size', 'weight'].forEach((kind) => {
      const val = row.querySelector(`[data-kind="${kind}"]`).value;
      if (val) entry[kind] = val;
    });
    if (Object.keys(entry).length) out[sec] = entry;
  });
  return out;
}

// ---- Editor ----
async function openEditor(id) {
  const item = await api(`/api/content/${id}`);
  CURRENT = item;
  $('#f-hook').value = item.hook || '';
  $('#f-body').value = item.body || '';
  $('#f-cta').value = item.cta || '';
  $('#f-caption').value = item.caption || '';
  $('#f-hashtags').value = (item.hashtags || []).join(' ');
  $('#f-date').value = item.scheduledDate || '';
  $('#f-time').value = item.scheduledTime || '';
  $('#f-duration').value = item.durationSec || 10;

  opt($('#f-pillar'), META.pillars.map((p) => p.key), item.pillar, META.pillars.map((p) => p.label));
  opt($('#f-template'), META.templates, item.template);
  opt($('#f-background'), META.backgrounds, item.background);
  opt($('#f-font'), (META.fonts || []).map((f) => f.key), item.font || 'serif', (META.fonts || []).map((f) => f.label));
  $('#f-bio-text').value = item.bioFooterText || 'link in bio';
  $('#f-bio-show').checked = item.showBioFooter !== false;
  opt($('#f-motion'), META.motions || ['subtle', 'still'], item.motion || 'subtle',
      (META.motions || ['subtle', 'still']).map((m) => m === 'subtle' ? 'Subtle (fade + slow zoom)' : 'Still (no movement)'));
  buildSectionStyles(item.styleOverrides || {});

  // Music: always show the block; if not configured, show a note + disable input.
  SELECTED_TRACK = item.audio || null;
  $('#music-block').style.display = '';
  $('#music-results').innerHTML = '';
  $('#music-q').value = '';
  const enabled = META.musicEnabled;
  $('#music-q').disabled = !enabled;
  $('#music-search').disabled = !enabled;
  if (!enabled) {
    $('#music-results').innerHTML =
      '<div class="hint">Music search is off. Add a free JAMENDO_CLIENT_ID to .env to enable it (see INSTAGRAM_SETUP / .env.example).</div>';
  }
  renderSelectedTrack();

  renderPreview(item);
  $('#e-hint').textContent = hintFor(item);
  setOverlay(true);
  bindLivePreviewInputs();
  updateLivePreview(); // render immediately on open
}

// Attach change/input listeners to every editor control so edits trigger a
// debounced live still-frame preview. Idempotent (guards with a flag).
let livePreviewBound = false;
function bindLivePreviewInputs() {
  const editor = document.querySelector('.editor');
  if (!editor || livePreviewBound) return;
  livePreviewBound = true;
  const skip = (e) => e.target.closest('.editor-actions') || e.target.closest('#music-block');
  editor.addEventListener('input', (e) => { if (!skip(e)) scheduleLivePreview(); });
  editor.addEventListener('change', (e) => { if (!skip(e)) scheduleLivePreview(); });
}

function setOverlay(open) {
  $('#overlay').classList.toggle('open', open);
  document.body.classList.toggle('modal-open', open);
  if (open) $('#overlay').scrollTop = 0;
}

function hintFor(item) {
  const live = META && META.publishLive;
  const postNote = live
    ? '“Post Now” will post to Instagram for real.'
    : '“Post Now” is a safe simulation until Instagram is set up (see INSTAGRAM_SETUP.md).';
  if (item.status === 'GENERATED') return 'Next: Render, then Approve.';
  if (item.status === 'RENDERED') return 'Preview looks good? Approve it.';
  if (item.status === 'APPROVED') return `Approved. Schedule it, or Post Now. ${postNote}`;
  if (item.status === 'SCHEDULED') return `Scheduled and shown in Upcoming. ${postNote}`;
  if (item.status === 'PUBLISHED') {
    return item.publish && item.publish.mock === false
      ? `Posted to Instagram ✓ ${item.publish.permalink || ''}`
      : 'Marked published (simulation). Nothing was actually posted.';
  }
  return '';
}

function renderPreview(item) {
  const v = $('#prev-video');
  if (item.videoFile) {
    // Strong cache-bust + explicit reload so a re-render (same filename) always
    // shows the newest MP4, never the browser's decoded old copy.
    const bust = `${Date.now()}-${Math.round(performance.now())}`;
    v.innerHTML = `<video controls playsinline preload="metadata"></video>`;
    const vid = v.querySelector('video');
    vid.src = `/media/${item.videoFile}?v=${bust}`;
    vid.load();
    v.style.display = '';
  } else {
    v.innerHTML = '';
    v.style.display = 'none';
  }
  $('#prev-caption').textContent = buildCaptionText(item);
}

// Rough client-side caption preview (server owns the real one on save).
function buildCaptionText(item) {
  return item.caption || '';
}

// ---- Live still-frame preview (debounced) ----
let previewTimer = null;
let previewSeq = 0;
function scheduleLivePreview() {
  const img = $('#prev-live');
  if (img) img.classList.add('stale');
  clearTimeout(previewTimer);
  previewTimer = setTimeout(updateLivePreview, 250);
}
async function updateLivePreview() {
  if (!CURRENT) return;
  const body = collect();
  const seq = ++previewSeq;
  $('#prev-status').textContent = 'updating…';
  try {
    const r = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('preview failed');
    const blob = await r.blob();
    if (seq !== previewSeq) return; // a newer edit superseded this one
    const img = $('#prev-live');
    const url = URL.createObjectURL(blob);
    img.onload = () => { img.classList.remove('stale'); URL.revokeObjectURL(url); };
    img.src = url;
    $('#prev-status').textContent = '';
    $('#prev-caption').textContent = body.caption || '';
  } catch (e) {
    if (seq === previewSeq) $('#prev-status').textContent = '(preview error)';
  }
}

// ---- Music search / selection ----
let SELECTED_TRACK = null;

function fmtDur(s) {
  s = Math.round(s || 0);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

async function musicSearch() {
  const q = $('#music-q').value.trim();
  const box = $('#music-results');
  box.innerHTML = '<div class="hint">searching…</div>';
  try {
    const r = await api(`/api/music/search?q=${encodeURIComponent(q)}`);
    if (!r.tracks.length) { box.innerHTML = '<div class="hint">no tracks found</div>'; return; }
    box.innerHTML = '';
    r.tracks.forEach((t) => {
      const el = document.createElement('div');
      el.className = 'music-item';
      el.innerHTML = `
        <div class="mi-main">
          <div class="mi-name">${escapeHtml(t.name)}</div>
          <div class="mi-sub">${escapeHtml(t.artist)} · ${fmtDur(t.duration)}</div>
        </div>
        <audio controls preload="none" src="${t.audio}"></audio>
        <button type="button">Use</button>`;
      el.querySelector('button').onclick = () => {
        SELECTED_TRACK = { id: t.id, name: t.name, artist: t.artist, audio: t.audio,
          license: t.license, shareUrl: t.shareUrl, duration: t.duration, startSec: 0 };
        renderSelectedTrack();
        scheduleLivePreview();
      };
      box.appendChild(el);
    });
  } catch (e) { box.innerHTML = `<div class="hint">${escapeHtml(e.message)}</div>`; }
}

function renderSelectedTrack() {
  const wrap = $('#music-selected');
  if (!SELECTED_TRACK) { wrap.innerHTML = ''; $('#music-hint').textContent = ''; return; }
  const t = SELECTED_TRACK;
  wrap.innerHTML = `
    ♪ ${escapeHtml(t.name)} — ${escapeHtml(t.artist)}
    <button type="button" id="music-clear" class="ghost" style="padding:2px 8px;font-size:12px;margin-left:8px;">remove</button>
    <div class="start-row">
      start at <input id="music-start" type="number" min="0" step="1" value="${Math.round(t.startSec || 0)}" /> sec
      <span>(track is ${fmtDur(t.duration)})</span>
    </div>`;
  $('#music-clear').onclick = () => { SELECTED_TRACK = null; renderSelectedTrack(); };
  $('#music-start').onchange = (e) => { SELECTED_TRACK.startSec = Number(e.target.value) || 0; };
  $('#music-hint').textContent = t.license
    ? 'Creative Commons — attribution may be required; check the license before wide use.'
    : 'Royalty-free track, baked into the video.';
}

function collect() {
  return {
    hook: $('#f-hook').value,
    body: $('#f-body').value,
    cta: $('#f-cta').value,
    caption: $('#f-caption').value,
    hashtags: $('#f-hashtags').value.split(/\s+/).filter(Boolean),
    pillar: $('#f-pillar').value,
    template: $('#f-template').value,
    background: $('#f-background').value,
    durationSec: Number($('#f-duration').value) || 10,
    font: $('#f-font').value,
    showBioFooter: $('#f-bio-show').checked,
    bioFooterText: $('#f-bio-text').value || 'link in bio',
    styleOverrides: collectSectionStyles(),
    motion: $('#f-motion').value || 'subtle',
    audio: SELECTED_TRACK,
    scheduledDate: $('#f-date').value || null,
    scheduledTime: $('#f-time').value || null,
  };
}

// Send-to-phone: save + ensure rendered, copy caption, show a QR to the video
// on the LAN so you scan it, save to Photos, and post in the IG app with any song.
async function sendToPhone() {
  await saveEditor();
  if (!CURRENT.videoFile) {
    toast('Rendering first…');
    const r = await api(`/api/content/${CURRENT.id}/render`, { method: 'POST' });
    CURRENT = r;
  }
  const base = META.lanBaseUrl;
  const panel = $('#phone-panel');
  if (!base) {
    panel.style.display = '';
    panel.innerHTML = '<h4>Send to Phone</h4><div class="hint">Could not detect your Mac’s Wi-Fi address. Make sure you’re on Wi-Fi and reload.</div>';
    return;
  }
  const videoUrl = `${base}/media/${CURRENT.videoFile}`;

  async function copyCaption() {
    try { await navigator.clipboard.writeText(CURRENT.caption || ''); return true; }
    catch { return false; }
  }
  const copied = await copyCaption();

  const qr = qrcode(0, 'M');
  qr.addData(videoUrl);
  qr.make();
  const qrImg = qr.createImgTag(6, 10); // bigger, easier to scan

  panel.style.display = '';
  panel.innerHTML = `
    <h4>Send to Phone → post with ANY song</h4>
    <div class="qr">${qrImg}</div>
    <label style="margin-top:4px;">Song you want to add (reminder for yourself)</label>
    <input id="phone-song" placeholder="e.g. Daddy Issues — The Neighbourhood" />
    <ol>
      <li>Scan the QR with your <b>iPhone camera</b> → video opens → <b>save to Photos</b>.</li>
      <li><b>Instagram → new Reel</b> → pick the saved video.</li>
      <li>Tap the <b>music</b> icon → search &amp; add your song.</li>
      <li><b>Paste the caption</b> ${copied ? '(copied ✓)' : ''} → share.</li>
    </ol>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <button type="button" id="phone-recopy" style="padding:6px 12px;font-size:12px;">Copy caption again</button>
      <span id="phone-copystate" class="cap-copied">${copied ? 'Caption + hashtags copied to clipboard.' : ''}</span>
    </div>
    <div class="hint" style="margin-top:8px;word-break:break-all;">Can’t scan? Open on your phone: ${videoUrl}</div>`;

  $('#phone-recopy').onclick = async () => {
    const ok = await copyCaption();
    $('#phone-copystate').textContent = ok ? 'Caption copied ✓' : 'Copy blocked — select the Caption box above and copy manually.';
  };
}

async function saveEditor() {
  const body = collect();
  const updated = await api(`/api/content/${CURRENT.id}`, { method: 'PUT', body });
  CURRENT = updated;
  renderPreview(updated);
  toast('Saved ✓');
  await load();
}

function bindEditor() {
  $('#e-close').onclick = () => setOverlay(false);
  $('#e-close-top').onclick = () => setOverlay(false);
  $('#music-search').onclick = () => musicSearch();
  $('#music-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); musicSearch(); } });
  $('#e-save').onclick = () => saveEditor().catch((e) => toast(e.message));
  $('#e-render').onclick = async () => { await saveEditor(); await renderItem(CURRENT.id); };
  $('#e-tophone').onclick = () => sendToPhone().catch((e) => toast(e.message));
  $('#e-approve').onclick = () => approveItem(CURRENT.id);
  $('#e-schedule').onclick = async () => {
    try {
      const b = { scheduledDate: $('#f-date').value, scheduledTime: $('#f-time').value };
      const u = await api(`/api/content/${CURRENT.id}/schedule`, { method: 'POST', body: b });
      CURRENT = u; toast('Scheduled ✓'); $('#e-hint').textContent = hintFor(u); await load();
    } catch (e) { toast(e.message); }
  };
  $('#e-publish').onclick = async () => {
    const live = META && META.publishLive;
    if (live && !confirm('Post this Reel to Instagram (@aurentarot) right now? This is real and public.')) return;
    try {
      const r = await api(`/api/content/${CURRENT.id}/publish`, { method: 'POST' });
      CURRENT = r.item;
      toast(r.live ? 'Posted to Instagram ✓' : 'Simulated post ✓ (Instagram not set up yet)');
      $('#e-hint').textContent = hintFor(r.item);
      await load();
    } catch (e) { toast(e.message); }
  };
  $('#e-delete').onclick = async () => {
    if (!confirm('Delete this reel?')) return;
    await api(`/api/content/${CURRENT.id}`, { method: 'DELETE' });
    setOverlay(false);
    toast('Deleted'); await load();
  };
}

$('#btn-generate').onclick = generate;
bindEditor();
load().catch((e) => toast(e.message));
