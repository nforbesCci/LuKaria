import { UserProvider } from '@auth0/nextjs-auth0/client';
import ThemeProvider from '../components/ThemeProvider';
import NavigationDrawer from '../components/NavigationDrawer';
import ClientLayout from '../components/ClientLayout';
import ReduxProvider from '../components/ReduxProvider';
import './globals.css';

export const metadata = {
  title: {
    default: 'Svelte by LuKaria - Virtual Medical Weight Loss | GLP-1 Medications',
    template: '%s | Svelte by LuKaria'
  },
  description: 'Virtual medical weight loss clinic offering GLP-1 medications like Mounjaro. Licensed physicians provide personalized weight loss plans through secure telehealth in Jamaica. Start your transformation today.',
  keywords: [
    'weight loss',
    'GLP-1 medications',
    'Mounjaro',
    'virtual healthcare',
    'telemedicine',
    'medical weight loss',
    'obesity treatment',
    'Jamaica healthcare',
    'weight management',
    'telehealth Jamaica',
    'online doctor consultation',
    'prescription weight loss',
    'Svelte',
    'LuKaria',
    'lifestyle medicine',
    'metabolic health'
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
    url: 'https://localhost:3000',
    title: 'Svelte by LuKaria - Virtual Medical Weight Loss',
    description: 'Virtual medical weight loss clinic offering GLP-1 medications. Licensed physicians provide personalized care through secure telehealth in Jamaica.',
    siteName: 'Svelte by LuKaria',
    images: [
      {
        url: '/images/Lukaria_logo.png',
        width: 1200,
        height: 630,
        alt: 'Svelte by LuKaria Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Svelte by LuKaria - Virtual Medical Weight Loss',
    description: 'Virtual medical weight loss clinic offering GLP-1 medications in Jamaica.',
    images: ['/images/Lukaria_logo.png'],
  },
  verification: {
    google: 'TAAk9hGtQmi6UwNq4n4g8UrBCM2w91kIZU0ndvLHlKw',
  },
  alternates: {
    canonical: 'https://localhost:3000',
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
