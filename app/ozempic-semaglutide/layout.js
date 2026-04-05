import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.ozempicSemaglutide);

export default function OzempicSemaglutideLayout({ children }) {
  return children;
}
