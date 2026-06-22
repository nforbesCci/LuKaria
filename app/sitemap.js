import { STATIC_SITEMAP_LASTMOD } from '../lib/sitemap-static-dates';
import { getPublicBlogPosts, getCanonicalBlogSegment } from '../lib/get-public-blog-posts';
import { SITE_URL } from '../lib/public-seo';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  // 1. Static Routes
  const staticRoutes = Object.entries(STATIC_SITEMAP_LASTMOD).map(([path, date]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(date),
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }));

  // 2. Dynamic Blog Routes
  let blogRoutes = [];
  try {
    const blogPosts = await getPublicBlogPosts();
    blogRoutes = blogPosts.map((post) => {
      const segment = getCanonicalBlogSegment(post);
      return {
        url: `${SITE_URL}/blog/${segment}`,
        lastModified: new Date(post.updatedAt || post.createdAt || new Date()),
        changeFrequency: 'monthly',
        priority: 0.6,
      };
    });
  } catch (err) {
    console.error('Failed to fetch blog posts for sitemap:', err);
  }

  return [...staticRoutes, ...blogRoutes];
}
