// AUREN Content Studio — central configuration.
// Everything tweakable lives here so you don't hunt through code.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export const PATHS = {
  data: path.join(ROOT, 'data'),
  content: path.join(ROOT, 'content'),
  assets: path.join(ROOT, 'assets'),
  ideas: path.join(ROOT, 'content', 'ideas'),
  drafts: path.join(ROOT, 'content', 'drafts'),
  approved: path.join(ROOT, 'content', 'approved'),
  rendered: path.join(ROOT, 'content', 'rendered'),
  published: path.join(ROOT, 'content', 'published'),
};

// ---- AUREN visual system ----
export const PALETTE = {
  midnight: {
    obsidian: '#0B0A0F',
    deepPlum: '#211827',
    darkWine: '#4A1F32',
    antiqueGold: '#C7A76C',
    warmIvory: '#EEE8DA',
    celestialBlue: '#7186A8',
  },
  moonlit: {
    parchment: '#F5F0E7',
    warmIvory: '#FBF8F2',
    mutedPlum: '#4A394D',
    dustyRose: '#815B68',
    antiqueGold: '#A8874F',
    deepCharcoal: '#242027',
  },
};

// Named, on-brand color swatches offered per text section in the editor.
// `theme` values resolve against the reel's background mode at render time
// (so "text"/"accent"/"muted" stay correct in both Midnight and Moonlit).
// Fixed hex swatches are also on-brand and render identically in both modes.
export const COLOR_SWATCHES = [
  { key: 'theme:text', label: 'Default text', theme: 'text' },
  { key: 'theme:accent', label: 'Antique gold', theme: 'accent' },
  { key: 'theme:muted', label: 'Muted (blue/rose)', theme: 'muted' },
  { key: 'theme:accentDim', label: 'Dim gold', theme: 'accentDim' },
  { key: 'hex:#EEE8DA', label: 'Warm ivory', hex: '#EEE8DA' },
  { key: 'hex:#7186A8', label: 'Celestial blue', hex: '#7186A8' },
  { key: 'hex:#815B68', label: 'Dusty rose', hex: '#815B68' },
  { key: 'hex:#4A1F32', label: 'Dark wine', hex: '#4A1F32' },
];

// How each background mode maps to concrete render colors.
// Values verified against the live AUREN site's style.css CSS variables
// (:root = midnight, [data-theme="moonlit"] = moonlit) — exact matches.
export const BACKGROUND_MODES = {
  midnight: {
    bg: PALETTE.midnight.obsidian,        // --bg
    bgAlt: PALETTE.midnight.deepPlum,     // --bg-2
    text: PALETTE.midnight.warmIvory,     // --text
    accent: PALETTE.midnight.antiqueGold, // --gold
    accentDim: '#8A6E3E',                 // --gold-dim (subtle CTA / tagline)
    muted: PALETTE.midnight.celestialBlue,// --text-2
  },
  moonlit: {
    bg: PALETTE.moonlit.parchment,        // --bg
    bgAlt: PALETTE.moonlit.warmIvory,     // --bg-2
    text: PALETTE.moonlit.deepCharcoal,   // --text
    accent: PALETTE.moonlit.antiqueGold,  // --gold
    accentDim: '#7A5E32',                 // --gold-dim
    muted: PALETTE.moonlit.dustyRose,     // --text-2
  },
};

// ---- Defaults written to data/settings.json on first run ----
export const DEFAULT_SETTINGS = {
  brand: {
    name: 'AUREN',
    // Primary tagline matches the live site wordmark (lowercased for IG feel).
    tagline: 'read between the signs',
    // Secondary editorial line, used on product end-frames.
    taglineEditorial: 'tarot for the considered mind',
    handle: '@aurentarot',
    ctaLine: 'get your free reading → link in bio',
    // Default font key for new reels ('serif' | 'sans' | 'mono' | 'custom:<file>').
    font: 'serif',
    // Default text for the pinned bottom "link in bio" band.
    // (On-screen, 🔮 renders as a crescent ☾ since librsvg can't draw color
    //  emoji; captions keep the real 🔮.)
    bioFooterText: 'link in bio 🔮',
  },
  // Content distribution. Must be keys of the pillar library. Sums are normalized.
  distribution: {
    founder: 0.30,
    tarot: 0.25,
    product: 0.20,
    relatable: 0.15,
    experimental: 0.10,
  },
  posting: {
    // default posting time (local) applied to suggested dates
    defaultTime: '18:00',
    // days of the week to schedule onto (0 = Sunday)
    weekStartsMonday: true,
  },
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 6, // default per-Reel length
};

export const PORT = process.env.PORT || 4321;
