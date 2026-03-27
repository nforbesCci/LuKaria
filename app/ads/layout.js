import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

const base = buildPageMetadata(routeMetadata.ads);

export const metadata = {
  ...base,
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function AdsLayout({ children }) {
  return children;
}
