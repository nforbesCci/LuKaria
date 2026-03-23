import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.about);

export default function AboutLayout({ children }) {
  return children;
}
