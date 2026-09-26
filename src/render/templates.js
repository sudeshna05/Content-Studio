// Data-driven Reel templates. A template describes how a content item maps to
// one or more "scenes" (frames). The renderer animates between/within scenes.
//
// Each scene: { lines:[{text, role}], align, durationSec }
// roles: 'hook' | 'body' | 'cta' | 'brand' | 'muted'
//
// Add a template by adding a function here and referencing it by key.

const BRAND_SCENE = (settings) => ({
  lines: [
    { text: settings.brand.name, role: 'brand' },
    // End-frame carries the editorial line for a premium sign-off.
    { text: settings.brand.taglineEditorial || settings.brand.tagline, role: 'muted' },
    { text: '', role: 'body' },
    { text: settings.brand.ctaLine, role: 'cta' },
  ],
  align: 'center',
  durationSec: 2.5,
});

function splitLines(text) {
  return (text || '').split('\n').map((t) => t);
}

const TEMPLATES = {
  // TEMPLATE 0 — SINGLE: everything on ONE screen for the full duration.
  // No line reveals, no scene changes. Subtle fade+zoom only. This is the
  // format that performs best on @aurentarot. Duration is configurable per
  // item via item.durationSec (defaults to 10s).
  single(item, settings) {
    const lines = [
      ...splitLines(item.hook).map((t) => ({ text: t, role: 'hook' })),
    ];
    if (item.body) {
      lines.push({ text: '', role: 'body' });
      lines.push(...splitLines(item.body).map((t) => ({ text: t, role: 'body' })));
    }
    if (item.cta) {
      lines.push({ text: '', role: 'body' });
      lines.push(...splitLines(item.cta).map((t) => ({ text: t, role: 'cta' })));
    }
    return [
      {
        lines,
        align: 'center',
        durationSec: Number(item.durationSec) > 0 ? Number(item.durationSec) : 10,
      },
    ];
  },

  // TEMPLATE 1 — FOUNDER: single screen, everything on one frame, subtle fade.
  founder(item, settings) {
    return [
      {
        lines: [
          ...splitLines(item.hook).map((t) => ({ text: t, role: 'hook' })),
          { text: '', role: 'body' },
          ...splitLines(item.body).map((t) => ({ text: t, role: 'body' })),
          { text: '', role: 'body' },
          ...splitLines(item.cta).map((t) => ({ text: t, role: 'cta' })),
        ],
        align: 'center',
        durationSec: 6,
      },
    ];
  },

  // TEMPLATE 2 — RELATABLE: hook then punchline reveal (two scenes).
  relatable(item, settings) {
    return [
      {
        lines: splitLines(item.hook).map((t) => ({ text: t, role: 'hook' })),
        align: 'center',
        durationSec: 2.5,
      },
      {
        lines: [
          ...splitLines(item.body).map((t) => ({ text: t, role: 'body' })),
          { text: '', role: 'body' },
          ...splitLines(item.cta).map((t) => ({ text: t, role: 'cta' })),
        ],
        align: 'center',
        durationSec: 3.5,
      },
    ];
  },

  // TEMPLATE 3 — PRODUCT: text overlays leading to a branded end frame.
  // (V1 renders text scenes; drop a screenshot into assets/product to extend.)
  product(item, settings) {
    return [
      {
        lines: splitLines(item.hook).map((t) => ({ text: t, role: 'hook' })),
        align: 'center',
        durationSec: 2,
      },
      {
        lines: splitLines(item.body).map((t) => ({ text: t, role: 'body' })),
        align: 'center',
        durationSec: 2.5,
      },
      {
        lines: splitLines(item.cta).map((t) => ({ text: t, role: 'cta' })),
        align: 'center',
        durationSec: 2,
      },
      BRAND_SCENE(settings),
    ];
  },
};

export function buildScenes(item, settings) {
  const fn = TEMPLATES[item.template] || TEMPLATES.founder;
  return fn(item, settings);
}

export const TEMPLATE_KEYS = Object.keys(TEMPLATES);
