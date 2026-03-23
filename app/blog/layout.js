import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.blog);

export default function BlogLayout({ children }) {
  return children;
}
