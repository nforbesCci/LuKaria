import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.testimonials);

export default function TestimonialsLayout({ children }) {
  return children;
}
