// On-screen emoji handling for rendered video text.
//
// librsvg (used by sharp) cannot render color emoji or many symbol glyphs — they
// come out as filled circles or "tofu" boxes. So for TEXT BAKED INTO THE VIDEO
// we substitute a curated set of AUREN-appropriate symbols that the serif/sans
// fonts actually render, and strip anything left over.
//
// Captions are NOT sanitized — Instagram renders real emoji fine there.

// Map common emoji -> on-brand symbols confirmed to render in Georgia/Helvetica.
// Kept intentionally minimal and editorial (crescent moon, star-ish marks, dots).
const EMOJI_MAP = {
  '😭': '',      // crying — drop (no tasteful equivalent); the line stands alone
  '😩': '',
  '😮‍💨': '',
  '🙂': '',
  '😅': '',
  '🥲': '',
  '✨': '☽',     // sparkles -> crescent
  '🔮': '☾',     // crystal ball -> crescent moon (very AUREN)
  '⭐': '☽',
  '🌙': '☾',
  '🌛': '☾',
  '🌜': '☽',
  '💫': '☽',
  '❤️': '♡',
  '❤': '♡',
  '🖤': '♡',
  '♥️': '♡',
  '💜': '♡',
  '👀': '',
  '🤔': '',
  '😌': '',
};

// A few non-emoji symbols we also normalize to render-safe equivalents.
const SYMBOL_MAP = {
  '✦': '☽',  // 4-point star (tofu in Georgia) -> crescent
  '✧': '☽',
  '❦': '',
  '•': '·',  // bullet -> mid dot (both fine, but keep consistent)
};

// Match most emoji codepoints (pictographic ranges) for the final strip pass.
const EMOJI_STRIP_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

// Symbols we explicitly WANT to keep even though they fall in the ranges above.
const KEEP = new Set(['☾', '☽', '♡', '·', '—', '~', '∴', '†', '◦']);

/**
 * Sanitize a single line of on-screen text:
 *  1. apply the emoji/symbol substitutions
 *  2. strip any remaining unrenderable pictographs (keeping our KEEP set)
 *  3. tidy whitespace
 */
export function sanitizeForRender(text) {
  if (!text) return text;
  let out = text;

  for (const [from, to] of Object.entries(EMOJI_MAP)) out = out.split(from).join(to);
  for (const [from, to] of Object.entries(SYMBOL_MAP)) out = out.split(from).join(to);

  out = out.replace(EMOJI_STRIP_RE, (ch) => (KEEP.has(ch) ? ch : ''));

  // collapse doubled spaces and trim trailing spaces left by removals
  out = out.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+$/gm, '');
  return out;
}
