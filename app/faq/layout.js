import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';
import FaqJsonLd from './FaqJsonLd';

export const metadata = buildPageMetadata(routeMetadata.faq);

export default function FaqLayout({ children }) {
  return (
    <>
      <FaqJsonLd />
      {children}
    </>
  );
}
