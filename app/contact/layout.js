import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.contact);

export default function ContactLayout({ children }) {
  return children;
}
