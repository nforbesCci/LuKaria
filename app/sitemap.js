/** Node runtime: MongoDB driver is not supported on Edge; Edge sitemap was causing 500s in prod. */
import { STATIC_SITEMAP_LASTMOD } from '../lib/sitemap-static-dates';

export const runtime = 'nodejs';

/** Refresh blog URLs periodically without rebuilding the whole site */
export const revalidate = 3600;

const BASE_URL = 'https://www.lukariagroup.com';

function lastModForPath(pathname) {
  const iso = STATIC_SITEMAP_LASTMOD[pathname];
  return iso ? new Date(iso) : new Date(STATIC_SITEMAP_LASTMOD['/'] || Date.now());
}

const staticRoutes = [
  { url: BASE_URL,                                  lastModified: lastModForPath('/'),               changeFrequency: 'weekly',  priority: 1.0  },
  { url: `${BASE_URL}/glp-1-weight-loss`,           lastModified: lastModForPath('/glp-1-weight-loss'), changeFrequency: 'monthly', priority: 0.95 },
  { url: `${BASE_URL}/ozempic-semaglutide`,        lastModified: lastModForPath('/ozempic-semaglutide'), changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/mounjaro-tirzepatide`,       lastModified: lastModForPath('/mounjaro-tirzepatide'), changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/info`,                        lastModified: lastModForPath('/info'),             changeFrequency: 'monthly', priority: 0.9  },
  { url: `${BASE_URL}/faq`,                         lastModified: lastModForPath('/faq'),             changeFrequency: 'monthly', priority: 0.85 },
  { url: `${BASE_URL}/about`,                       lastModified: lastModForPath('/about'),            changeFrequency: 'monthly', priority: 0.85 },
  { url: `${BASE_URL}/testimonials`,                lastModified: lastModForPath('/testimonials'),      changeFrequency: 'monthly', priority: 0.8  },
  { url: `${BASE_URL}/contact`,                     lastModified: lastModForPath('/contact'),          changeFrequency: 'monthly', priority: 0.8  },
  { url: `${BASE_URL}/blog`,                        lastModified: lastModForPath('/blog'),             changeFrequency: 'weekly',  priority: 0.75 },
  { url: `${BASE_URL}/privacy-policy`,              lastModified: lastModForPath('/privacy-policy'),   changeFrequency: 'yearly',  priority: 0.3  },
  { url: `${BASE_URL}/terms`,                       lastModified: lastModForPath('/terms'),            changeFrequency: 'yearly',  priority: 0.3  },
  // /ads is excluded — paid landing page, not for organic indexing
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
  // Skip MongoDB when env not set; avoids import-time throw from lib/mongodb
  if (!process.env.MONGODB_URI) {
    return [];
  }
  const { getDatabase } = await import('../lib/mongodb');
  // 5s timeout: beat common serverless limits (~10s) so we return static before platform kills us
  const db = await withTimeout(getDatabase(), 5000, 'MongoDB getDatabase');
  const posts = await withTimeout(
    db.collection('blogPosts').find({}).project({ _id: 1, slug: 1, updatedAt: 1, createdAt: 1 }).toArray(),
    5000,
    'MongoDB blogPosts query'
  );
  return posts.map((p) => {
    const seg = p.slug && String(p.slug).trim() ? String(p.slug).trim() : String(p._id);
    return {
      url: `${BASE_URL}/blog/${seg}`,
      lastModified: p.updatedAt || p.createdAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    };
  });
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
