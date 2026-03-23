import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.ads);

export default function AdsLayout({ children }) {
  return children;
}
