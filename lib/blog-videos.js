import { getYouTubeEmbedUrl, getYouTubeVideoId } from './business';

/**
 * Resolved list of { url, title } for a post (supports legacy single `videoUrl`).
 */
export function normalizePostVideos(post) {
  if (!post) return [];
  if (Array.isArray(post.videos) && post.videos.length) {
    return post.videos
      .map((v) => ({
        url: String(v?.url || '').trim(),
        title: String(v?.title || '').trim(),
      }))
      .filter((v) => v.url && getYouTubeEmbedUrl(v.url));
  }
  if (post.videoUrl && getYouTubeEmbedUrl(post.videoUrl)) {
    return [
      {
        url: post.videoUrl.trim(),
        title: (post.videoTitle || post.title || '').trim() || post.title,
      },
    ];
  }
  return [];
}

export function parseVideosJsonFromForm(formData) {
  const raw = formData.get('videosJson');
  if (raw == null || String(raw).trim() === '') return [];
  try {
    const arr = JSON.parse(String(raw));
    if (!Array.isArray(arr)) return [];
    return arr.map((v) => ({
      url: String(v?.url ?? '').trim(),
      title: String(v?.title ?? '').trim(),
    }));
  } catch {
    return [];
  }
}

/** Keep only valid YouTube entries for DB */
export function sanitizeStoredVideos(entries) {
  return entries
    .map((v) => ({
      url: String(v.url || '').trim(),
      title: String(v.title || '').trim(),
    }))
    .filter((v) => v.url && getYouTubeEmbedUrl(v.url));
}

/**
 * Whether this post is a "video blog" (embedded YouTube) vs a text article.
 * Uses explicit `postKind` when set; otherwise infers from legacy `videos` / `videoUrl`.
 */
export function isVideoBlogPost(post) {
  if (!post) return false;
  if (post.postKind === 'article') return false;
  if (post.postKind === 'video') return true;
  return normalizePostVideos(post).length > 0;
}
