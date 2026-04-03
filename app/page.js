import dynamic from 'next/dynamic';
import HomePageChrome from './HomePageChrome';
import HomeHeroBackdropStatic from '../components/home/HomeHeroBackdropStatic';
import HomeHeroStatic from '../components/home/HomeHeroStatic';
import HomeMeetDoctorStatic from '../components/home/HomeMeetDoctorStatic';
import HomeVirtualIntroStatic from '../components/home/HomeVirtualIntroStatic';
import HomeYmyGuide from '../components/home/HomeYmyGuide';

const HomeBelowFold = dynamic(() => import('../components/home/HomeBelowFold'), {
  loading: () => (
    <div
      style={{
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 0',
      }}
      aria-busy="true"
      aria-label="Loading section"
    />
  ),
  ssr: true,
});

/** Static marketing shell improves TTFB/LCP; hero/meet-doctor are server components for LCP. */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <HomePageChrome>
      <HomeHeroBackdropStatic />
      <HomeHeroStatic />
      <HomeMeetDoctorStatic />
      <HomeBelowFold />
      <HomeVirtualIntroStatic />
      <HomeYmyGuide />
    </HomePageChrome>
  );
}
