// ContentGenerator interface.
// V1: LocalContentGenerator (deterministic/template, $0, no network).
// V2: AIContentGenerator (optional, behind this same interface) — NOT built yet.

export class ContentGenerator {
  /**
   * @param {object} opts
   * @param {number} opts.count       how many concepts to generate
   * @param {object} opts.distribution pillar -> weight
   * @param {object} opts.settings    brand settings
   * @param {Date}   opts.startDate   first suggested posting date
   * @returns {Promise<object[]>} array of content items (see shape in LocalContentGenerator)
   */
  async generate(_opts) {
    throw new Error('ContentGenerator.generate not implemented');
  }
}
