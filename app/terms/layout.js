import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.terms);

export default function TermsLayout({ children }) {
  return children;
}
