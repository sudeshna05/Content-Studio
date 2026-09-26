// Turn one scene into a 1080x1920 PNG buffer using an SVG + sharp.
// Real typography, exact AUREN colors, centered layout. No browser needed.
//
// Supports per-section (per-role) font + color overrides. Each role — hook,
// body, cta, footer — can independently pick a font and an on-brand color.
// Unset roles fall back to the theme defaults.

import sharp from 'sharp';
import { VIDEO, BACKGROUND_MODES, COLOR_SWATCHES } from '../config.js';
import { resolveFont } from './fonts.js';

const W = VIDEO.width;
const H = VIDEO.height;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Base per-role spec (size/weight/spacing + default theme color slot).
function baseRole(role) {
  switch (role) {
    case 'brand': return { size: 92, colorSlot: 'accent', weight: 600, spacing: 8 };
    case 'hook': return { size: 64, colorSlot: 'text', weight: 500, spacing: 0 };
    case 'cta': return { size: 52, colorSlot: 'accent', weight: 500, spacing: 0 };
    case 'muted': return { size: 34, colorSlot: 'muted', weight: 400, spacing: 4 };
    case 'body':
    default: return { size: 56, colorSlot: 'text', weight: 400, spacing: 0 };
  }
}

// Named size scale steps -> multiplier applied to the role's base size.
const SIZE_SCALE = { xs: 0.7, s: 0.85, m: 1, l: 1.2, xl: 1.45 };
export const SIZE_KEYS = Object.keys(SIZE_SCALE);
function resolveSize(baseSize, sizeKey) {
  const mult = SIZE_SCALE[sizeKey] || 1;
  return Math.round(baseSize * mult);
}

// Named weight steps -> numeric font-weight.
const WEIGHTS = { light: 300, regular: 400, medium: 500, semibold: 600, bold: 700 };
export const WEIGHT_KEYS = Object.keys(WEIGHTS);
function resolveWeight(baseWeight, weightKey) {
  return WEIGHTS[weightKey] || baseWeight;
}

// Resolve a color swatch key ("theme:accent" | "hex:#RRGGBB") against the theme.
function resolveColor(key, colors, fallback) {
  if (!key) return fallback;
  const sw = COLOR_SWATCHES.find((s) => s.key === key);
  if (!sw) return fallback;
  if (sw.hex) return sw.hex;
  if (sw.theme) return colors[sw.theme] || fallback;
  return fallback;
}

// Which override bucket applies to a given line role.
// hook/brand -> 'hook'; body/muted -> 'body'; cta -> 'cta'.
function overrideKeyFor(role) {
  if (role === 'hook' || role === 'brand') return 'hook';
  if (role === 'cta') return 'cta';
  return 'body';
}

/**
 * Build a resolver that, given a font key, returns { family } and registers any
 * custom @font-face CSS (deduped) so multiple per-role fonts can coexist.
 */
function makeFontRegistry(defaultFontKey) {
  const faces = new Map(); // fontKey -> { family, faceCss }
  function use(fontKey) {
    const key = fontKey || defaultFontKey || 'serif';
    if (!faces.has(key)) {
      const resolved = resolveFont(key);
      // Give custom fonts a unique family per key so they don't collide.
      if (resolved.faceCss) {
        const uniq = 'F' + [...faces.keys(), key].length + '_' + key.replace(/[^a-z0-9]/gi, '');
        const family = `'${uniq}', serif`;
        const faceCss = resolved.faceCss.replace(/font-family:'[^']+'/, `font-family:'${uniq}'`);
        faces.set(key, { family, faceCss });
      } else {
        faces.set(key, { family: resolved.family, faceCss: '' });
      }
    }
    return faces.get(key).family;
  }
  function allFaceCss() {
    return [...faces.values()].map((f) => f.faceCss).filter(Boolean).join('\n');
  }
  return { use, allFaceCss };
}

function buildSvg(scene, colors, opts) {
  const overrides = opts.styleOverrides || {};
  const footer = opts.footer || {};
  const reg = makeFontRegistry(opts.fontKey);

  const lines = scene.lines || [];

  const footerReserve = footer.show ? 200 : 0;
  const usableH = H - footerReserve;

  // Resolve each line's effective style (size/weight honor per-section overrides).
  const resolved = lines.map((l) => {
    const b = baseRole(l.role);
    const ov = overrides[overrideKeyFor(l.role)] || {};
    return {
      line: l,
      base: b,
      ov,
      size: resolveSize(b.size, ov.size),
      weight: resolveWeight(b.weight, ov.weight),
    };
  });

  const gaps = resolved.map((r) => (r.line.text === '' ? 28 : r.size * 1.32));
  const total = gaps.reduce((a, b) => a + b, 0);
  let y = (usableH - total) / 2 + (gaps[0] || 0) * 0.7;

  const tspans = resolved
    .map((r, i) => {
      if (r.line.text === '') {
        const out = `<text x="${W / 2}" y="${y}" opacity="0"> </text>`;
        y += gaps[i];
        return out;
      }
      const family = reg.use(r.ov.font);
      const fill = resolveColor(r.ov.color, colors, colors[r.base.colorSlot]);
      const t = `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${family}"
        font-size="${r.size}" font-weight="${r.weight}" fill="${fill}"
        letter-spacing="${r.base.spacing}">${esc(r.line.text)}</text>`;
      y += gaps[i];
      return t;
    })
    .join('\n');

  // Pinned bottom footer band ("link in bio" style CTA), with its own overrides.
  let footerSvg = '';
  if (footer.show) {
    const ov = overrides.footer || {};
    const family = reg.use(ov.font);
    const fill = resolveColor(ov.color, colors, colors.accent);
    const size = resolveSize(38, ov.size);
    const weight = resolveWeight(500, ov.weight);
    const fy = H - 160; // clear of Instagram's bottom UI overlay zone
    footerSvg = `<text x="${W / 2}" y="${fy}" text-anchor="middle" font-family="${family}"
      font-size="${size}" font-weight="${weight}" fill="${fill}"
      letter-spacing="3">${esc(footer.text || 'link in bio')}</text>`;
  }

  const faceCss = reg.allFaceCss();
  const styleBlock = faceCss ? `<style type="text/css"><![CDATA[${faceCss}]]></style>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    ${styleBlock}
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${colors.bg}"/>
      <stop offset="100%" stop-color="${colors.bgAlt}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  ${tspans}
  ${footerSvg}
</svg>`;
}

/**
 * Render a scene to a PNG file.
 * @param {object} scene
 * @param {string} backgroundMode 'midnight' | 'moonlit'
 * @param {string} outPath
 * @param {object} opts { fontKey, footer:{show,text}, styleOverrides:{hook,body,cta,footer} }
 *   each override entry: { font?: string, color?: string }
 */
export async function renderSceneToPng(scene, backgroundMode, outPath, opts = {}) {
  const colors = BACKGROUND_MODES[backgroundMode] || BACKGROUND_MODES.midnight;
  const svg = buildSvg(scene, colors, opts);

  await sharp(Buffer.from(svg), { density: 200 })
    .resize(W, H, { fit: 'fill' })
    .png()
    .toFile(outPath);
  return outPath;
}
