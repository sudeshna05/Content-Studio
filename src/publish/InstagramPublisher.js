// InstagramPublisher interface.
//
// V1: MockInstagramPublisher (simulates upload/processing/published).
// V3: RealInstagramPublisher using Meta's official Instagram Graph API for
//     Professional (Business/Creator) accounts. See TODO in the mock.
//
// NEVER store Instagram passwords or session cookies. Real publishing uses an
// OAuth access token read from environment variables only.

export class InstagramPublisher {
  /**
   * @param {object} item      approved content item (must have videoFile + caption)
   * @param {function} onEvent optional (stage, detail) progress callback
   * @returns {Promise<{ status: string, permalink?: string, mediaId?: string }>}
   */
  async publishReel(_item, _onEvent) {
    throw new Error('InstagramPublisher.publishReel not implemented');
  }
}
