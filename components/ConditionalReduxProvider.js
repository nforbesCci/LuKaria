'use client';

import { usePathname } from 'next/navigation';
import { Provider } from 'react-redux';
import { store } from '../store';
import { isMarketingPublicSurface } from '../lib/public-paths';

/**
 * Omits Redux on the marketing shell so homepage/public routes do not download
 * activate/store slices until the user navigates to an authenticated area.
 */
export default function ConditionalReduxProvider({ children }) {
  const pathname = usePathname() || '';
  if (isMarketingPublicSurface(pathname)) {
    return children;
  }
  return <Provider store={store}>{children}</Provider>;
}
