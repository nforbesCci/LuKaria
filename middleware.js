import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import { isPublicPath } from './lib/public-paths';

export default function middleware(req) {
  const { pathname } = req.nextUrl;
  
  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Native mobile / API clients send Authorization: Bearer <JWT>.
  // Cookie session is still enforced for browser traffic below.
  // Route handlers validate the JWT via getApiSession().
  const authHeader = req.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
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
     * - media (public audio/video, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images|media).*)',
  ],
};
