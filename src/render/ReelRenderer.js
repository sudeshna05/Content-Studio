// ReelRenderer interface. V1: FFmpegReelRenderer. Swap freely later.

export class ReelRenderer {
  /**
   * @param {object} item     content item
   * @param {object} settings brand settings
   * @returns {Promise<{ videoFile: string }>} path to the rendered MP4
   */
  async render(_item, _settings) {
    throw new Error('ReelRenderer.render not implemented');
  }
}
