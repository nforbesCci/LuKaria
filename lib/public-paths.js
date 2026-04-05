/**
 * Paths that skip auth middleware and use the public (light) marketing shell.
 * Keep in sync with middleware.js.
 */
const PUBLIC_EXACT = new Set([
  '/',
  '/ads',
  '/info',
  '/faq',
  '/contact',
  '/about',
  '/glp-1-weight-loss',
  '/ozempic-semaglutide',
  '/mounjaro-tirzepatide',
  '/testimonials',
  '/blog',
  '/information',
  '/unauthorized',
  '/consultation-required',
  '/privacy-policy',
  '/terms',
  '/robots.txt',
  '/llms.txt',
  '/sitemap.xml',
]);

export function isPublicPath(pathname) {
  if (!pathname) return false;
  return (
    PUBLIC_EXACT.has(pathname) ||
    pathname.startsWith('/blog') ||
    // List/read blog JSON for crawlers and anonymous users; POST/PUT/DELETE still enforced in route handlers
    pathname.startsWith('/api/blog')
  );
}

/** Marketing pages that use PublicTopMenu only (no sidebar drawer, no Redux for shell). */
export function isMarketingPublicSurface(pathname) {
  if (!pathname) return false;
  if (pathname === '/') return true;
  return isPublicPath(pathname);
}
