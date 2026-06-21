import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.weightLossInjections);

export default function WeightLossInjectionsLayout({ children }) {
  return children;
}
