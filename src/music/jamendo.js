// Jamendo music client — search royalty-free / Creative Commons tracks and
// download audio to bake into a reel. Free API (needs a free client_id).
//
// Requires in .env:
//   JAMENDO_CLIENT_ID
//
// Jamendo API docs: https://developer.jamendo.com/v3.0
// We request only tracks with audio download available and surface license info
// so the user knows if attribution is required.

import fs from 'node:fs';

const API = 'https://api.jamendo.com/v3.0';

export function jamendoConfigured(env = process.env) {
  return !!env.JAMENDO_CLIENT_ID;
}

/**
 * Search tracks by text query.
 * @returns {Promise<Array<{id,name,artist,duration,audio,license,shareUrl,image}>>}
 */
export async function searchTracks(query, { limit = 20, env = process.env } = {}) {
  if (!jamendoConfigured(env)) {
    throw new Error('Music search not configured. Add JAMENDO_CLIENT_ID to .env (free from developer.jamendo.com).');
  }
  const url = new URL(`${API}/tracks/`);
  url.searchParams.set('client_id', env.JAMENDO_CLIENT_ID);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('search', query || '');
  url.searchParams.set('audioformat', 'mp32');       // downloadable mp3
  url.searchParams.set('include', 'licenses musicinfo');
  url.searchParams.set('order', 'popularity_total');

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (data?.headers?.status !== 'success') {
    throw new Error(`Jamendo error: ${data?.headers?.error_message || res.statusText}`);
  }
  return (data.results || []).map((t) => ({
    id: t.id,
    name: t.name,
    artist: t.artist_name,
    duration: Number(t.duration) || 0,
    // Prefer the streaming `audio` URL — the `audiodownload` URL often 500s.
    audio: t.audio || t.audiodownload,
    license: t.license_ccurl || '',
    shareUrl: t.shareurl || '',
    image: t.album_image || t.image || '',
  }));
}

/** Download a track's audio to a local file path. */
export async function downloadTrack(audioUrl, destPath) {
  const res = await fetch(audioUrl);
  if (!res.ok) throw new Error(`Failed to download track (${res.status}).`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return destPath;
}
