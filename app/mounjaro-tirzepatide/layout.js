import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.mounjaroTirzepatide);

export default function MounjaroTirzepatideLayout({ children }) {
  return children;
}
