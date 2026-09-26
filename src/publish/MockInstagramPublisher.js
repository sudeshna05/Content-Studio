// Mock publisher. Simulates the Instagram Reel publish lifecycle WITHOUT doing
// anything on the network. Nothing is ever posted in V1.

import { InstagramPublisher } from './InstagramPublisher.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class MockInstagramPublisher extends InstagramPublisher {
  async publishReel(item, onEvent = () => {}) {
    if (!item.videoFile) throw new Error('Cannot publish: item has no rendered video.');
    if (item.status !== 'APPROVED' && item.status !== 'SCHEDULED') {
      throw new Error('Cannot publish: item is not APPROVED.');
    }

    onEvent('UPLOAD', 'Uploading rendered MP4 (simulated)…');
    await wait(400);

    onEvent('PROCESSING', 'Instagram is processing the Reel (simulated)…');
    await wait(600);

    onEvent('PUBLISHED', 'Reel published (simulated). Nothing was actually posted.');

    // A fake but clearly-fake permalink so the UI has something to show.
    return {
      status: 'PUBLISHED',
      mock: true,
      mediaId: `mock_${Date.now()}`,
      permalink: 'https://instagram.com/aurentarot (mock — not posted)',
    };

    /* =========================================================================
     * TODO (V3) — RealInstagramPublisher via Meta's Instagram Graph API.
     *
     * Prerequisites (you set these up once, later — NOT now):
     *   - Instagram account must be Professional (Business or Creator).
     *   - Linked to a Facebook Page; app reviewed for instagram_content_publish.
     *   - Long-lived IG access token in env: IG_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID.
     *   - The MP4 must be reachable via a public HTTPS URL (Instagram pulls it;
     *     you cannot upload the file bytes directly for Reels). Options: a
     *     temporary signed URL, a small static host, or ngrok during testing.
     *
     * Flow:
     *   1. POST /{ig-user-id}/media
     *        media_type=REELS, video_url=<public mp4 url>, caption=<caption>
     *      -> returns a creation container id.
     *   2. Poll GET /{container-id}?fields=status_code until FINISHED.
     *   3. POST /{ig-user-id}/media_publish  creation_id=<container id>
     *      -> returns the published media id.
     *   4. GET /{media-id}?fields=permalink  for the real permalink.
     *
     * Keep this behind the InstagramPublisher interface so the dashboard code
     * never changes. Read all secrets from process.env — never hardcode.
     * ========================================================================= */
  }
}
