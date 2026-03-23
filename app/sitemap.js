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

export default async function sitemap() {
  let blogPosts = [];
  try {
    const { getDatabase } = await import('../lib/mongodb');
    const db = await getDatabase();
    const posts = await db.collection('blogPosts').find({}).project({ _id: 1, updatedAt: 1, createdAt: 1 }).toArray();
    blogPosts = posts.map((p) => ({
      url: `${BASE_URL}/blog/${String(p._id)}`,
      lastModified: p.updatedAt || p.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));
  } catch (err) {
    console.error('Sitemap: Failed to fetch blog posts, using static routes only', err?.message || err);
  }

  return [...staticRoutes, ...blogPosts];
}
