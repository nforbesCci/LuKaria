import { UserProvider } from '@auth0/nextjs-auth0/client';
import ThemeProvider from '../components/ThemeProvider';
import NavigationDrawer from '../components/NavigationDrawer';
import ClientLayout from '../components/ClientLayout';
import ReduxProvider from '../components/ReduxProvider';
import './globals.css';

export const metadata = {
  title: {
    default: 'Medical Weight Loss Jamaica | Doctor-Guided Care | Svelte by LuKaria',
    template: '%s | Svelte by LuKaria'
  },
  description: 'Medical weight loss Jamaica with doctor-guided care. Svelte by LuKaria offers virtual GLP-1 weight loss including Ozempic, Mounjaro and Tirzepatide. Safe, physician-supervised weight management from home.',
  keywords: [
    'medical weight loss Jamaica',
    'doctor-guided care',
    'GLP-1 weight loss',
    'Ozempic Jamaica',
    'Mounjaro Jamaica',
    'Tirzepatide',
    'Semaglutide',
    'virtual weight loss clinic',
    'telemedicine Jamaica',
    'weight loss centre Jamaica',
    'obesity treatment',
    'weight management',
    'physician-supervised weight loss',
    'telehealth Jamaica',
    'Svelte',
    'LuKaria',
    'Kadria Fairclough',
    'Dr. Kadria Fairclough'
  ],
  authors: [{ name: 'LuKaria' }],
  creator: 'LuKaria',
  publisher: 'LuKaria',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_JM',
    url: 'https://www.lukariagroup.com',
    title: 'Medical Weight Loss Jamaica | Doctor-Guided Care | Svelte by LuKaria',
    description: 'Medical weight loss Jamaica with doctor-guided care. GLP-1 weight loss including Ozempic, Mounjaro and Tirzepatide. Physician-supervised virtual consultations.',
    siteName: 'Svelte by LuKaria',
    images: [
      {
        url: 'https://www.lukariagroup.com/images/Lukaria_logo.png',
        width: 1200,
        height: 630,
        alt: 'Svelte by LuKaria Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medical Weight Loss Jamaica | Doctor-Guided Care | Svelte by LuKaria',
    description: 'Medical weight loss Jamaica with doctor-guided care. GLP-1 weight loss including Ozempic, Mounjaro and Tirzepatide.',
    images: ['https://www.lukariagroup.com/images/Lukaria_logo.png'],
  },
  verification: {
    google: 'TAAk9hGtQmi6UwNq4n4g8UrBCM2w91kIZU0ndvLHlKw',
  },
  alternates: {
    canonical: 'https://www.lukariagroup.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap" rel="stylesheet" />
        <script src="https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.4/dist/quagga.min.js" async></script>        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress hydration warnings for browser extension attributes
              if (typeof window !== 'undefined') {
                const originalError = console.error;
                console.error = (...args) => {
                  if (
                    args[0]?.includes?.('hydration') ||
                    args[0]?.includes?.('Warning: Extra attributes from the server') ||
                    args[0]?.includes?.('data-new-gr-c-s-check-loaded') ||
                    args[0]?.includes?.('data-gr-ext-installed')
                  ) {
                    return;
                  }
                  originalError.apply(console, args);
                };
              }
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.lukariagroup.com/#website',
                  url: 'https://www.lukariagroup.com',
                  name: 'Svelte by LuKaria',
                  description: 'Medical weight loss Jamaica with doctor-guided care.',
                  publisher: { '@id': 'https://www.lukariagroup.com/#organization' },
                  inLanguage: 'en-JM',
                },
                {
                  '@type': 'ImageObject',
                  '@id': 'https://www.lukariagroup.com/#logo',
                  url: 'https://www.lukariagroup.com/images/Lukaria_logo.png',
                  width: 1200,
                  height: 630,
                },
                {
                  '@type': 'Organization',
                  '@id': 'https://www.lukariagroup.com/#organization',
                  name: 'Svelte by LuKaria',
                  url: 'https://www.lukariagroup.com',
                  logo: { '@id': 'https://www.lukariagroup.com/#logo' },
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+1-876-290-3659',
                    contactType: 'customer service',
                    areaServed: 'JM',
                    availableLanguage: 'English',
                    email: 'svelte@lukariagroup.com',
                  },
                },
                {
                  '@type': 'MedicalOrganization',
                  '@id': 'https://www.lukariagroup.com/#localbusiness',
                  name: 'Svelte by LuKaria',
                  description: 'Medical weight loss clinic in Jamaica with doctor-guided care. Physician-supervised weight loss programs.',
                  url: 'https://www.lukariagroup.com',
                  telephone: '+1-876-290-3659',
                  email: 'svelte@lukariagroup.com',
                  address: { '@type': 'PostalAddress', addressCountry: 'JM', addressRegion: 'Jamaica' },
                  areaServed: { '@type': 'Country', name: 'Jamaica' },
                },
                {
                  '@type': 'Physician',
                  '@id': 'https://www.lukariagroup.com/#physician',
                  name: 'Dr. Kadria Fairclough',
                  jobTitle: 'Physician',
                  credential: ['BSc', 'BMedSci', 'MBBS', 'LMCC'],
                  worksFor: { '@id': 'https://www.lukariagroup.com/#organization' },
                  description: 'Licensed physician with over 15 years of experience, specializing in medically supervised weight loss and lifestyle medicine.',
                  knowsAbout: ['Weight Management', 'Obesity Medicine', 'Lifestyle Medicine'],
                },
              ],
            }),
          }}
        />
      </head>
            <body suppressHydrationWarning={true}>
              <UserProvider>
                <ReduxProvider>
                  <ThemeProvider>
                    <ClientLayout>
                      <NavigationDrawer />
                      {children}
                    </ClientLayout>
                  </ThemeProvider>
                </ReduxProvider>
              </UserProvider>
            </body>
    </html>
  );
}
