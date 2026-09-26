// Build a caption from a content object. The concept already carries a base
// caption; we append the AUREN CTA line and hashtags in a clean, non-spammy way.

export function buildCaption({ caption, hashtags, cta }, settings) {
  const parts = [];
  if (caption) parts.push(caption.trim());

  const ctaLine = settings?.brand?.ctaLine || 'get your free reading → link in bio';
  parts.push(`🔮 ${ctaLine}`);

  if (hashtags?.length) parts.push(hashtags.join(' '));

  return parts.join('\n\n');
}
