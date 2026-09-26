// CLI renderer — `npm run render -- <itemId>` or `npm run render` (renders all
// GENERATED items that don't yet have a video). Handy for batch rendering.

import { FFmpegReelRenderer } from '../src/render/FFmpegReelRenderer.js';
import * as store from '../src/store.js';

const renderer = new FFmpegReelRenderer();

async function main() {
  const id = process.argv[2];
  const settings = await store.getSettings();
  const items = await store.getItems();

  const targets = id
    ? items.filter((i) => i.id === id)
    : items.filter((i) => !i.videoFile && (i.status === 'GENERATED' || i.status === 'IDEA'));

  if (!targets.length) {
    console.log('Nothing to render.');
    return;
  }

  for (const item of targets) {
    process.stdout.write(`Rendering ${item.id} … `);
    const { videoFile } = await renderer.render(item, settings);
    await store.upsertItem({ ...item, videoFile, status: 'RENDERED' });
    console.log(`done → content/${videoFile}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
