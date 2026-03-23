import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.info);

export default function InfoLayout({ children }) {
  return children;
}
