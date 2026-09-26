// RealInstagramPublisher — posts a Reel to Instagram for REAL via the
// Instagram API with Instagram Login (graph.instagram.com).
//
// This matches the token you get from "API setup with Instagram login" in the
// Meta app dashboard (token prefix IGAA...). It does NOT use the older
// Facebook-Page path (graph.facebook.com). Verified: this token type can
// create media containers and publish.
//
// This does NOT mock. Missing token or video URL -> clear error, never a fake
// success.
//
// Requires:
//   - IG_ACCESS_TOKEN       : Instagram Login access token (IGAA...)
//   - item.publicVideoUrl   : a PUBLIC https URL to the rendered MP4
//                             (Instagram pulls the file; local paths won't work)
//
// Flow:
//   1. POST /me/media          media_type=REELS, video_url, caption   -> container id
//   2. Poll GET /{container-id}?fields=status_code  until FINISHED
//   3. POST /me/media_publish  creation_id=container id               -> media id
//   4. GET  /{media-id}?fields=permalink                              -> permalink

import { InstagramPublisher } from './InstagramPublisher.js';

const GRAPH = 'https://graph.instagram.com/v21.0';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class RealInstagramPublisher extends InstagramPublisher {
  constructor(env = process.env) {
    super();
    this.token = env.IG_ACCESS_TOKEN;
  }

  _assertReady(item) {
    if (!this.token) {
      throw new Error(
        'Real Instagram posting is not configured. Missing IG_ACCESS_TOKEN in .env. ' +
        'See INSTAGRAM_SETUP.md.'
      );
    }
    if (!item.publicVideoUrl) {
      throw new Error(
        'No public video URL. Instagram must fetch the MP4 from a public https URL; ' +
        'a local file path will not work. Provide a public video URL (see INSTAGRAM_SETUP.md, step 5).'
      );
    }
  }

  async _api(path, { method = 'GET', params = {} } = {}) {
    const url = new URL(`${GRAPH}${path}`);
    const body = new URLSearchParams();
    body.set('access_token', this.token);
    for (const [k, v] of Object.entries(params)) body.set(k, v);

    const opts = { method };
    if (method === 'GET') {
      for (const [k, v] of body.entries()) url.searchParams.set(k, v);
    } else {
      opts.body = body;
    }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.error) {
      throw new Error(`Instagram API error: ${data.error?.message || res.statusText}`);
    }
    return data;
  }

  async publishReel(item, onEvent = () => {}) {
    this._assertReady(item);
    if (item.status !== 'APPROVED' && item.status !== 'SCHEDULED') {
      throw new Error('Cannot publish: item is not APPROVED.');
    }

    // 1. Create the Reels media container.
    onEvent('UPLOAD', 'Creating Reel container on Instagram…');
    const container = await this._api('/me/media', {
      method: 'POST',
      params: {
        media_type: 'REELS',
        video_url: item.publicVideoUrl,
        caption: item.caption || '',
        share_to_feed: 'true',
      },
    });
    const creationId = container.id;

    // 2. Poll until Instagram finishes processing the video.
    onEvent('PROCESSING', 'Instagram is processing the video…');
    let ready = false;
    for (let i = 0; i < 40; i++) { // up to ~3.5 min
      const status = await this._api(`/${creationId}`, { params: { fields: 'status_code,status' } });
      if (status.status_code === 'FINISHED') { ready = true; break; }
      if (status.status_code === 'ERROR') {
        throw new Error(`Instagram failed to process the video: ${status.status || 'unknown error'}`);
      }
      await wait(5000);
    }
    if (!ready) throw new Error('Timed out waiting for Instagram to process the video.');

    // 3. Publish the container.
    onEvent('PUBLISHING', 'Publishing the Reel…');
    const published = await this._api('/me/media_publish', {
      method: 'POST',
      params: { creation_id: creationId },
    });
    const mediaId = published.id;

    // 4. Fetch the permalink.
    let permalink = null;
    try {
      const info = await this._api(`/${mediaId}`, { params: { fields: 'permalink' } });
      permalink = info.permalink || null;
    } catch { /* non-fatal */ }

    onEvent('PUBLISHED', 'Reel published to Instagram.');
    return { status: 'PUBLISHED', mediaId, permalink, mock: false };
  }
}
