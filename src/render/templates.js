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

  // TEMPLATE 2 — RELATABLE: hook + body + CTA all on ONE screen (hook always
  // visible now), held for the reel duration with a subtle reveal.
  relatable(item, settings) {
    return [oneScreen(item)];
  },

  // TEMPLATE 3 — PRODUCT: everything on one screen, then a branded end frame.
  // (Drop a screenshot into assets/product to extend later.)
  product(item, settings) {
    return [
      { ...oneScreen(item), durationSec: Number(item.durationSec) > 0 ? Math.max(3, Number(item.durationSec) - 2.5) : 7 },
      BRAND_SCENE(settings),
    ];
  },
};

// Shared "all text on one screen" layout: hook, then body, then CTA — together.
function oneScreen(item) {
  const lines = [...splitLines(item.hook).map((t) => ({ text: t, role: 'hook' }))];
  if (item.body) {
    lines.push({ text: '', role: 'body' });
    lines.push(...splitLines(item.body).map((t) => ({ text: t, role: 'body' })));
  }
  if (item.cta) {
    lines.push({ text: '', role: 'body' });
    lines.push(...splitLines(item.cta).map((t) => ({ text: t, role: 'cta' })));
  }
  return {
    lines,
    align: 'center',
    durationSec: Number(item.durationSec) > 0 ? Number(item.durationSec) : 10,
  };
}

export function buildScenes(item, settings) {
  const fn = TEMPLATES[item.template] || TEMPLATES.founder;
  return fn(item, settings);
}

export const TEMPLATE_KEYS = Object.keys(TEMPLATES);
