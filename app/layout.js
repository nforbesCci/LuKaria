import { UserProvider } from '@auth0/nextjs-auth0/client';
import ThemeProvider from '../components/ThemeProvider';
import NavigationDrawer from '../components/NavigationDrawer';
import ClientLayout from '../components/ClientLayout';
import ReduxProvider from '../components/ReduxProvider';
import { REGISTERED_OFFICE, OFFICE_OPENING_HOURS_SCHEMA } from '../lib/business';
import { getOrganizationSameAs, getPhysicianSameAs } from '../lib/seo-constants';
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
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap"
          rel="stylesheet"
        />
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
              '@graph': (() => {
                const orgSameAs = getOrganizationSameAs();
                const physicianSameAs = getPhysicianSameAs();
                return [
                {
                  '@type': 'WebSite',
                  '@id': 'https://www.lukariagroup.com/#website',
                  url: 'https://www.lukariagroup.com',
                  name: 'Svelte by LuKaria',
                  description: 'Medical weight loss Jamaica with doctor-guided care.',
                  publisher: { '@id': 'https://www.lukariagroup.com/#organization' },
                  inLanguage: 'en-JM',
                  potentialAction: [
                    {
                      '@type': 'ReserveAction',
                      name: 'Book a free consultation',
                      target: {
                        '@type': 'EntryPoint',
                        urlTemplate: 'https://calendly.com/kadriaf-lukariagroup/30min',
                        actionPlatform: [
                          'http://schema.org/DesktopWebPlatform',
                          'http://schema.org/MobileWebPlatform',
                        ],
                      },
                    },
                    {
                      '@type': 'ContactAction',
                      name: 'Contact Svelte by LuKaria',
                      target: 'https://www.lukariagroup.com/contact',
                    },
                  ],
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
                  ...(orgSameAs.length ? { sameAs: orgSameAs } : {}),
                },
                {
                  '@type': 'MedicalOrganization',
                  '@id': 'https://www.lukariagroup.com/#localbusiness',
                  name: 'Svelte by LuKaria',
                  description:
                    'Medical weight loss clinic in Jamaica with doctor-guided care. Physician-supervised weight loss programs. Registered office in Kingston; care delivered virtually with in-person visits by arrangement.',
                  url: 'https://www.lukariagroup.com',
                  telephone: '+1-876-290-3659',
                  email: 'svelte@lukariagroup.com',
                  address: {
                    '@type': 'PostalAddress',
                    streetAddress: REGISTERED_OFFICE.streetAddress,
                    addressLocality: REGISTERED_OFFICE.addressLocality,
                    addressRegion: REGISTERED_OFFICE.addressRegion,
                    addressCountry: REGISTERED_OFFICE.addressCountry,
                  },
                  areaServed: { '@type': 'Country', name: 'Jamaica' },
                  openingHoursSpecification: OFFICE_OPENING_HOURS_SCHEMA,
                  ...(orgSameAs.length ? { sameAs: orgSameAs } : {}),
                },
                {
                  '@type': 'Physician',
                  '@id': 'https://www.lukariagroup.com/#physician',
                  name: 'Dr. Kadria Fairclough',
                  jobTitle: 'Physician',
                  credential: ['BSc', 'BMedSci', 'MBBS', 'LMCC'],
                  worksFor: { '@id': 'https://www.lukariagroup.com/#organization' },
                  description:
                    'Licensed physician with over 15 years of experience, specializing in medically supervised weight loss and lifestyle medicine. Extensive telehealth experience serving patients in Jamaica and Canada.',
                  knowsAbout: ['Weight Management', 'Obesity Medicine', 'Lifestyle Medicine'],
                  url: 'https://www.lukariagroup.com/about',
                  ...(physicianSameAs.length ? { sameAs: physicianSameAs } : {}),
                },
              ];
              })(),
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
