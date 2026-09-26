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
  buildSectionStyles(item.styleOverrides || {});

  renderPreview(item);
  $('#e-hint').textContent = hintFor(item);
  setOverlay(true);
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
    v.innerHTML = `<video controls src="/media/${item.videoFile}"></video>`;
  } else {
    v.innerHTML = '<div class="novid">no video yet<br/>click Render Reel</div>';
  }
  $('#prev-caption').textContent = item.caption || '';
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
    scheduledDate: $('#f-date').value || null,
    scheduledTime: $('#f-time').value || null,
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
  $('#e-save').onclick = () => saveEditor().catch((e) => toast(e.message));
  $('#e-render').onclick = async () => { await saveEditor(); await renderItem(CURRENT.id); };
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
