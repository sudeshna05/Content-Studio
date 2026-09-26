// FFmpeg-based renderer.
//  1. Render each scene to a PNG (real typography via SVG + sharp).
//  2. For each scene, make a short clip: fade-in, hold, fade-out, subtle zoom.
//  3. Concatenate clips into one 1080x1920 30fps MP4.
//
// Pure local FFmpeg. No paid services, no AI footage.

import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ReelRenderer } from './ReelRenderer.js';
import { buildScenes } from './templates.js';
import { renderSceneToPng } from './frame.js';
import { VIDEO, PATHS } from '../config.js';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d.toString()));
    p.on('error', reject);
    p.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}:\n${err.slice(-800)}`))
    );
  });
}

function slug(item) {
  const date = item.scheduledDate || new Date().toISOString().slice(0, 10);
  const n = String((item.id || '').replace(/[^a-z0-9]/gi, '').slice(-3) || '001');
  return `${date}-${item.pillar}-${n}`;
}

export class FFmpegReelRenderer extends ReelRenderer {
  constructor(ffmpegPath = process.env.FFMPEG_PATH || 'ffmpeg') {
    super();
    this.ffmpeg = ffmpegPath;
  }

  async render(item, settings) {
    const scenes = buildScenes(item, settings);
    const outName = `${slug(item)}.mp4`;
    const outPath = path.join(PATHS.rendered, outName);
    await fs.mkdir(PATHS.rendered, { recursive: true });

    // Custom total duration applies to ALL templates: scale each scene's
    // natural durationSec proportionally so the scenes sum to item.durationSec.
    const target = Number(item.durationSec) > 0 ? Number(item.durationSec) : null;
    const natural = scenes.reduce((a, s) => a + (s.durationSec || 3), 0);
    const factor = target && natural > 0 ? target / natural : 1;

    // Font + footer + per-section style options passed to every scene frame.
    const frameOpts = {
      fontKey: item.font || settings?.brand?.font || 'serif', // whole-reel default
      footer: {
        show: item.showBioFooter !== false, // on by default
        text: item.bioFooterText || settings?.brand?.bioFooterText || 'link in bio',
      },
      // Per-section overrides: { hook, body, cta, footer } each {font?, color?}.
      styleOverrides: item.styleOverrides || {},
    };

    const work = await fs.mkdtemp(path.join(os.tmpdir(), 'auren-reel-'));
    try {
      const clipPaths = [];
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const png = path.join(work, `scene-${i}.png`);
        await renderSceneToPng(scene, item.background, png, frameOpts);

        const clip = path.join(work, `clip-${i}.mp4`);
        const dur = Math.max(1, (scene.durationSec || 3) * factor);
        const fps = VIDEO.fps;
        const fade = 0.4;
        // zoompan gives a slow subtle scale; fade in/out on top.
        const frames = Math.round(dur * fps);
        const vf = [
          `scale=${VIDEO.width * 2}:-1`,
          `zoompan=z='min(zoom+0.0006,1.05)':d=${frames}:s=${VIDEO.width}x${VIDEO.height}:fps=${fps}`,
          `fade=t=in:st=0:d=${fade}`,
          `fade=t=out:st=${Math.max(0, dur - fade)}:d=${fade}`,
          'format=yuv420p',
        ].join(',');

        await run(this.ffmpeg, [
          '-y',
          '-loop', '1',
          '-i', png,
          '-t', String(dur),
          '-r', String(fps),
          '-vf', vf,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          clip,
        ]);
        clipPaths.push(clip);
      }

      // Concat via demuxer (all clips share codec/params).
      const listFile = path.join(work, 'list.txt');
      await fs.writeFile(
        listFile,
        clipPaths.map((c) => `file '${c.replace(/'/g, "'\\''")}'`).join('\n'),
        'utf8'
      );

      await run(this.ffmpeg, [
        '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', listFile,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart',
        outPath,
      ]);

      return { videoFile: path.relative(PATHS.content, outPath) };
    } finally {
      // best-effort cleanup
      try { await fs.rm(work, { recursive: true, force: true }); } catch { /* ignore */ }
    }
  }
}
