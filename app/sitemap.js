const BASE_URL = 'https://www.lukariagroup.com';

const staticRoutes = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  { url: `${BASE_URL}/ads`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { url: `${BASE_URL}/info`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
];

function withTimeout(promise, ms, label = 'operation') {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function fetchBlogRoutesForSitemap() {
  const { getDatabase } = await import('../lib/mongodb');
  const db = await withTimeout(getDatabase(), 12000, 'MongoDB getDatabase');
  const posts = await withTimeout(
    db.collection('blogPosts').find({}).project({ _id: 1, updatedAt: 1, createdAt: 1 }).toArray(),
    12000,
    'MongoDB blogPosts query'
  );
  return posts.map((p) => ({
    url: `${BASE_URL}/blog/${String(p._id)}`,
    lastModified: p.updatedAt || p.createdAt || new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));
}

/**
 * Never throw: production sitemaps must return 200 with at least static URLs.
 */
export default async function sitemap() {
  try {
    let blogPosts = [];
    try {
      blogPosts = await fetchBlogRoutesForSitemap();
    } catch (err) {
      console.error('Sitemap: Failed to fetch blog posts, using static routes only', err?.message || err);
    }
    return [...staticRoutes, ...blogPosts];
  } catch (fatal) {
    console.error('Sitemap: fatal error, returning static routes only', fatal?.message || fatal);
    return staticRoutes;
  }
}
