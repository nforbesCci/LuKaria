import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.privacyPolicy);

export default function PrivacyPolicyLayout({ children }) {
  return children;
}
