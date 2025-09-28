import { UserProvider } from '@auth0/nextjs-auth0/client';
import ThemeProvider from '../components/ThemeProvider';
import NavigationDrawer from '../components/NavigationDrawer';
import ClientLayout from '../components/ClientLayout';
import ReduxProvider from '../components/ReduxProvider';
import './globals.css';

export const metadata = {
  title: 'Svelte by LuKaria',
  description: 'Ultimate Weight Loss Journey',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="emotion-insertion-point" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&display=swap" rel="stylesheet" />
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
