import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.svelteSustain);

export default function SvelteSustainLayout({ children }) {
  return children;
}
