import HomePageClient from './HomePageClient';

/** Force SSR on every request — no static pre-render */
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <HomePageClient />;
}
