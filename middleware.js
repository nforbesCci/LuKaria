import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';

// Public paths that don't require authentication
const publicPaths = ['/', '/ads', '/info', '/faq', '/contact', '/about', '/blog', '/information', '/unauthorized', '/consultation-required', '/privacy-policy', '/terms'];

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Allow public paths without authentication
  if (publicPaths.includes(pathname) || pathname.startsWith('/blog') || pathname === '/sitemap.xml') {
    return NextResponse.next();
  }
  
  // Apply authentication to all other routes
  return withMiddlewareAuthRequired()(req);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (Auth0 API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images folder)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
