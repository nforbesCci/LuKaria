import { SITE_URL } from './public-seo';

/**
 * Path segment for /blog/[slug] — prefers stored slug, falls back to legacy _id.
 * @param {{ _id?: string, slug?: string | null }} post
 */
export function getPublicBlogSegment(post) {
  if (!post?._id) return '';
  const raw = post.slug != null && String(post.slug).trim() ? String(post.slug).trim() : String(post._id);
  return raw;
}

/** @param {{ _id?: string, slug?: string | null }} post */
export function getPublicBlogPath(post) {
  const seg = getPublicBlogSegment(post);
  return seg ? `/blog/${seg}` : '/blog';
}

/** Absolute canonical URL for a post. */
export function getPublicBlogCanonicalUrl(post) {
  return `${SITE_URL}${getPublicBlogPath(post)}`;
}
