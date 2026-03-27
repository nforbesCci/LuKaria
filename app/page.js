import HomePageChrome from './HomePageChrome';
import HomeHeroStatic from '../components/home/HomeHeroStatic';
import HomeMeetDoctorStatic from '../components/home/HomeMeetDoctorStatic';

/** Static marketing shell improves TTFB/LCP; hero/meet-doctor are server components for LCP. */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <HomePageChrome>
      <HomeHeroStatic />
      <HomeMeetDoctorStatic />
    </HomePageChrome>
  );
}
