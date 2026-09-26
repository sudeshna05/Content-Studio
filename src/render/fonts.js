// Font handling for reel rendering.
//
// Two kinds of fonts are offered:
//   1. Built-in stacks (serif / sans / mono) — always available, no files.
//   2. Any .ttf/.otf you drop into assets/fonts/ — embedded into the SVG as a
//      base64 @font-face so librsvg renders it reliably (no system install
//      needed).

import fs from 'node:fs';
import path from 'node:path';
import { PATHS } from '../config.js';

const FONT_DIR = path.join(PATHS.assets, 'fonts');

export const BUILTIN_FONTS = {
  serif: { label: 'Serif (Georgia)', stack: "Georgia, 'Times New Roman', serif" },
  sans: { label: 'Sans (Helvetica)', stack: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  mono: { label: 'Mono (Menlo)', stack: "Menlo, 'Courier New', monospace" },
};

function ext(f) {
  return path.extname(f).toLowerCase();
}

/** List custom font files present in assets/fonts/. */
export function listCustomFonts() {
  try {
    return fs
      .readdirSync(FONT_DIR)
      .filter((f) => ['.ttf', '.otf', '.woff', '.woff2'].includes(ext(f)))
      .map((f) => ({ key: `custom:${f}`, label: f.replace(/\.[^.]+$/, ''), file: f }));
  } catch {
    return [];
  }
}

/** Everything the UI can offer. */
export function listFonts() {
  const builtins = Object.entries(BUILTIN_FONTS).map(([k, v]) => ({ key: k, label: v.label }));
  return [...builtins, ...listCustomFonts()];
}

const MIME = {
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/**
 * Resolve a font key to what the SVG needs:
 *   { family, faceCss }
 * - family: the font-family value to put on <text>
 * - faceCss: an optional <style> body embedding the custom font (empty for builtins)
 */
export function resolveFont(fontKey) {
  if (!fontKey || BUILTIN_FONTS[fontKey]) {
    const b = BUILTIN_FONTS[fontKey] || BUILTIN_FONTS.serif;
    return { family: b.stack, faceCss: '' };
  }
  if (fontKey.startsWith('custom:')) {
    const file = fontKey.slice('custom:'.length);
    const full = path.join(FONT_DIR, file);
    try {
      const buf = fs.readFileSync(full);
      const b64 = buf.toString('base64');
      const mime = MIME[ext(file)] || 'font/ttf';
      const family = 'AURENCustom';
      const faceCss = `@font-face{font-family:'${family}';src:url(data:${mime};base64,${b64});}`;
      return { family: `'${family}', serif`, faceCss };
    } catch {
      // fall back gracefully if the file vanished
      return { family: BUILTIN_FONTS.serif.stack, faceCss: '' };
    }
  }
  return { family: BUILTIN_FONTS.serif.stack, faceCss: '' };
}
