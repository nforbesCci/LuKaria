/**
 * next-sitemap config — available for supplementary/static sitemap generation.
 *
 * The primary sitemap is served dynamically via app/sitemap.js (Next.js App Router)
 * which also includes live blog post URLs from MongoDB. next-sitemap is installed
 * and this config is ready if a static fallback sitemap is ever needed.
 *
 * To generate a static sitemap manually run: npx next-sitemap
 * @type {import('next-sitemap').IConfig}
 */
module.exports = {
  siteUrl: 'https://www.lukariagroup.com',
  generateRobotsTxt: false, // robots.txt is managed manually in public/

  // Exclude authenticated, admin, and non-public routes
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/profile',
    '/profile/*',
    '/admin',
    '/admin/*',
    '/schedule',
    '/schedule/*',
    '/weight-logging',
    '/weight-logging/*',
    '/meal-tracker',
    '/meal-tracker/*',
    '/medication-tracker',
    '/medication-tracker/*',
    '/side-effects',
    '/side-effects/*',
    '/consent-forms',
    '/consent-forms/*',
    '/consultation-required',
    '/unauthorized',
    '/lab-requisition',
    '/lab-requisition/*',
    '/barcode-scanner',
    '/barcode-scanner/*',
    '/api/*',
    '/blog/new',
    '/blog/new/*',
    '/blog/*/edit',
    '/ads', // ads landing page — exclude from organic sitemap
  ],

  // Default changefreq and priority
  changefreq: 'weekly',
  priority: 0.7,

  // Per-path overrides
  transform: async (config, path) => {
    const overrides = {
      '/': { priority: 1.0, changefreq: 'weekly' },
      '/glp-1-weight-loss': { priority: 0.95, changefreq: 'monthly' },
      '/info': { priority: 0.9, changefreq: 'monthly' },
      '/faq': { priority: 0.85, changefreq: 'monthly' },
      '/about': { priority: 0.85, changefreq: 'monthly' },
      '/testimonials': { priority: 0.8, changefreq: 'monthly' },
      '/contact': { priority: 0.8, changefreq: 'monthly' },
      '/blog': { priority: 0.75, changefreq: 'weekly' },
      '/privacy-policy': { priority: 0.3, changefreq: 'yearly' },
      '/terms': { priority: 0.3, changefreq: 'yearly' },
    };

    const override = overrides[path] || {};

    return {
      loc: path,
      changefreq: override.changefreq ?? config.changefreq,
      priority: override.priority ?? config.priority,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },
};
