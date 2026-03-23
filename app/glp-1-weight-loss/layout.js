import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.glp1WeightLoss);

export default function Glp1Layout({ children }) {
  return children;
}
