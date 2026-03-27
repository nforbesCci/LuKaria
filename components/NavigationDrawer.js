'use client';

import { usePathname } from 'next/navigation';
import { isMarketingPublicSurface } from '../lib/public-paths';
import NavigationDrawerInner from './NavigationDrawerInner';

/**
 * Marketing routes skip the drawer entirely so we can omit Redux on those pages.
 * Authenticated app routes render the inner drawer (requires Provider).
 */
export default function NavigationDrawer() {
  const pathname = usePathname() || '';
  if (isMarketingPublicSurface(pathname)) return null;
  return <NavigationDrawerInner />;
}
