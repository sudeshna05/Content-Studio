// Local, deterministic content generator. No AI, no network, $0.
//
// Strategy:
//  1. Turn the distribution into an integer count per pillar (largest-remainder,
//     so 7 items across 5 pillars still sums to exactly 7).
//  2. For each pillar, pick DISTINCT concepts (never repeat the same concept
//     within one batch) so the 7 posts are genuinely varied.
//  3. Assemble a full content item: hook/body/cta/caption/hashtags/style/date.

import { PILLARS, HASHTAGS } from './library.js';
import { buildCaption } from '../caption/captionBuilder.js';
import { ContentGenerator } from './ContentGenerator.js';
import { suggestDates } from '../schedule/scheduler.js';

// Deterministic-ish shuffle seeded by a rotating cursor stored per run, so
// repeated "Generate" clicks surface different concepts instead of the same
// first N every time. We avoid Math.random dependency on determinism concerns
// by using a simple offset derived from the batch's own size + timestamp.
function pickDistinct(concepts, n, offset) {
  const pool = [...concepts];
  const out = [];
  let i = offset % Math.max(pool.length, 1);
  while (out.length < n && pool.length) {
    out.push(pool.splice(i % pool.length, 1)[0]);
    i += 3; // stride so consecutive picks aren't adjacent
  }
  return out;
}

// Largest-remainder apportionment: weights -> integer counts summing to total.
function apportion(distribution, total) {
  const keys = Object.keys(distribution);
  const sum = keys.reduce((a, k) => a + (distribution[k] || 0), 0) || 1;
  const raw = keys.map((k) => ({ k, exact: (distribution[k] / sum) * total }));
  const floored = raw.map((r) => ({ ...r, base: Math.floor(r.exact), rem: r.exact - Math.floor(r.exact) }));
  let assigned = floored.reduce((a, r) => a + r.base, 0);
  floored.sort((a, b) => b.rem - a.rem);
  let idx = 0;
  while (assigned < total && floored.length) {
    floored[idx % floored.length].base += 1;
    assigned += 1;
    idx += 1;
  }
  const result = {};
  for (const r of floored) if (r.base > 0) result[r.k] = r.base;
  return result;
}

export class LocalContentGenerator extends ContentGenerator {
  async generate({ count = 7, distribution, settings, startDate = new Date(), pillar = null } = {}) {
    // If a single pillar is requested, put the whole batch into it.
    const dist = pillar && PILLARS[pillar] ? { [pillar]: 1 } : distribution;
    const counts = apportion(dist, count);
    const dates = suggestDates(startDate, count, settings);

    const items = [];
    let offset = Math.floor(startDate.getTime() / 1000) % 97; // varies between runs

    for (const [pillarKey, n] of Object.entries(counts)) {
      const pillar = PILLARS[pillarKey];
      if (!pillar) continue;
      const picks = pickDistinct(pillar.concepts, n, offset);
      offset += 5;

      for (const concept of picks) {
        const hashtags = HASHTAGS[pillarKey] || ['#AURENTarot'];
        const item = {
          id: `${pillarKey}-${concept.id}-${offset}-${items.length}`,
          status: 'GENERATED',
          pillar: pillarKey,
          pillarLabel: pillar.label,
          conceptId: concept.id,
          concept: `${concept.hook} …`, // short human-readable summary
          hook: concept.hook,
          body: concept.body,
          cta: concept.cta,
          caption: null, // filled below
          hashtags,
          template: pillar.defaultTemplate,
          background: pillar.defaultBackground,
          durationSec: 10, // total reel length; scaled across scenes for all templates
          font: settings?.brand?.font || 'serif',
          showBioFooter: true,
          bioFooterText: settings?.brand?.bioFooterText || 'link in bio',
          scheduledDate: null, // filled below
          scheduledTime: settings?.posting?.defaultTime || '18:00',
          videoFile: null,
          createdAt: new Date().toISOString(),
        };
        item.caption = buildCaption(
          { caption: concept.caption, hashtags, cta: concept.cta },
          settings
        );
        items.push(item);
      }
    }

    // Assign suggested dates in order (Mon..Sun style spread).
    items.forEach((it, i) => {
      it.scheduledDate = dates[i] || dates[dates.length - 1] || null;
    });

    return items;
  }
}
