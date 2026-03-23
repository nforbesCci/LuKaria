import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.faq);

export default function FaqLayout({ children }) {
  return children;
}
