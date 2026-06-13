import { UserProvider } from '@auth0/nextjs-auth0/client';
import ThemeProvider from '../components/ThemeProvider';
import NavigationDrawer from '../components/NavigationDrawer';
import ClientLayout from '../components/ClientLayout';
import ConditionalReduxProvider from '../components/ConditionalReduxProvider';
import WhatsAppWidget from '../components/WhatsAppWidget';
import { SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION } from '../lib/public-seo';
import { getRootSchemaGraph } from '../lib/root-json-ld';
import './globals.css';

export const metadata = {
  title: {
    default: SITE_DEFAULT_TITLE,
    template: '%s | Svelte by LuKaria'
  },
  description: SITE_DEFAULT_DESCRIPTION,
  keywords: [
    'weight loss Jamaica',
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
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
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
    title: SITE_DEFAULT_TITLE,
    description: SITE_DEFAULT_DESCRIPTION,
    images: ['https://www.lukariagroup.com/images/Lukaria_logo.png'],
  },
  verification: {
    google: 'TAAk9hGtQmi6UwNq4n4g8UrBCM2w91kIZU0ndvLHlKw',
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
          id="schema-org-global-graph"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': getRootSchemaGraph(),
            }),
          }}
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "wx752zjhnl");
            `
          }}
        />
      </head>
            <body suppressHydrationWarning={true}>
              <UserProvider>
                <ConditionalReduxProvider>
                  <ThemeProvider>
                    <ClientLayout>
                      <NavigationDrawer />
                      {children}
                    </ClientLayout>
                    <WhatsAppWidget />
                  </ThemeProvider>
                </ConditionalReduxProvider>
              </UserProvider>
            </body>
    </html>
  );
}
