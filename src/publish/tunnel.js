// Ephemeral public URL for the local server via `cloudflared` quick tunnel.
// Free, no account. Used only while posting so Instagram can fetch the MP4.
//
// startTunnel(localPort) -> { url, stop() }
//   url  : https://<random>.trycloudflare.com  (proxies to http://localhost:localPort)
//   stop : kills the tunnel process

import { spawn } from 'node:child_process';

const CLOUDFLARED = process.env.CLOUDFLARED_PATH || 'cloudflared';

export function startTunnel(localPort, { timeoutMs = 30000 } = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(CLOUDFLARED, [
      'tunnel',
      '--url', `http://localhost:${localPort}`,
      '--no-autoupdate',
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    let settled = false;
    const urlRe = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/i;

    const onData = (buf) => {
      const text = buf.toString();
      const m = text.match(urlRe);
      if (m && !settled) {
        settled = true;
        clearTimeout(timer);
        resolve({
          url: m[0],
          stop: () => { try { proc.kill(); } catch { /* ignore */ } },
        });
      }
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData); // cloudflared prints the URL to stderr

    proc.on('error', (err) => {
      if (!settled) { settled = true; clearTimeout(timer); reject(err); }
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        try { proc.kill(); } catch { /* ignore */ }
        reject(new Error('cloudflared did not produce a public URL in time.'));
      }
    }, timeoutMs);
  });
}
