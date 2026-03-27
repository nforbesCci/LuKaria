'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Script from 'next/script';
import SEO from '../components/SEO';
import PublicTopMenu from '../components/PublicTopMenu';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Login, WhatsApp } from '@mui/icons-material';

const HomeBelowFold = dynamic(() => import('../components/home/HomeBelowFold'), {
  loading: () => (
    <Box sx={{ minHeight: 320, display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
      <CircularProgress size={32} sx={{ color: '#877449' }} aria-label="Loading section" />
    </Box>
  ),
  ssr: true,
});

/** Client shell: nav, auth redirect, analytics — LCP lives in server `children` */
export default function HomePageChrome({ children }) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;
    const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
    const isOnlyDoctor =
      userGroups.includes('Doctor') &&
      !userGroups.includes('Admin') &&
      !userGroups.includes('Patient');
    if (isOnlyDoctor) {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (error) {
    console.error('Auth0 Error:', error);
    return (
      <>
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Alert severity="error">Authentication error: {error.message}</Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => (window.location.href = '/api/auth/login')}
              sx={{
                backgroundColor: '#877449',
                color: '#000000',
                '&:hover': { backgroundColor: '#6b5d3a' },
              }}
            >
              Try Login Again
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  if (!isLoading && user) {
    const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
    const isOnlyDoctor =
      userGroups.includes('Doctor') &&
      !userGroups.includes('Admin') &&
      !userGroups.includes('Patient');
    return (
      <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {isOnlyDoctor ? 'Redirecting to Administration...' : 'Redirecting to Dashboard...'}
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href="https://www.lukariagroup.com/" />
      </Head>
      <script
        id="schema-homepage-medicalbusiness"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['MedicalBusiness', 'MedicalOrganization'],
            '@id': 'https://www.lukariagroup.com/#medicalbusiness',
            name: 'Svelte by LuKaria',
            alternateName: 'LuKaria Medical Weight Loss',
            description:
              'Virtual GLP-1 medical weight loss clinic in Jamaica. Physician-supervised programs with Ozempic, Mounjaro and Tirzepatide. Doctor-guided care island-wide via telehealth.',
            url: 'https://www.lukariagroup.com',
            telephone: '+1-876-290-3659',
            email: 'svelte@lukariagroup.com',
            priceRange: '$$',
            medicalSpecialty: 'Bariatric Medicine',
            hasMap: 'https://www.google.com/maps?cid=9880637014440882752',
            sameAs: ['https://www.google.com/maps?cid=9880637014440882752'],
            address: {
              '@type': 'PostalAddress',
              streetAddress: '19 Fairdene Avenue',
              addressLocality: 'Kingston',
              addressRegion: 'Jamaica',
              addressCountry: 'JM',
            },
            areaServed: { '@type': 'Country', name: 'Jamaica' },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '17:00',
              },
            ],
            availableService: [
              {
                '@type': 'MedicalTherapy',
                name: 'GLP-1 Weight Loss (Semaglutide / Tirzepatide)',
                description:
                  'Physician-supervised GLP-1 medication programs for chronic weight management, including semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro).',
              },
              {
                '@type': 'MedicalTherapy',
                name: 'Virtual Weight Loss Consultations',
                description:
                  'Telehealth consultations with a licensed physician for personalised weight loss treatment plans across Jamaica.',
              },
            ],
            founder: {
              '@type': 'Physician',
              '@id': 'https://www.lukariagroup.com/#physician',
              name: 'Dr. Kadria Fairclough',
              url: 'https://www.lukariagroup.com/about',
            },
          }),
        }}
      />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            strategy="lazyOnload"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <SEO
        title="Virtual GLP-1 Weight Loss Jamaica | Svelte by LuKaria"
        description="Virtual GLP-1 medical weight loss in Jamaica. Physician-supervised care with Ozempic, Mounjaro & Tirzepatide. Free consultation — flat monthly fee, no waiting rooms."
        keywords="medical weight loss Jamaica, GLP-1 weight loss Jamaica, virtual weight loss clinic, doctor-guided care, Ozempic Jamaica, Mounjaro Jamaica, Tirzepatide, Semaglutide, telemedicine Jamaica, obesity treatment, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com"
      />
      <PublicTopMenu currentPath="/" />

      <Box
        sx={{
          position: 'fixed',
          top: 48,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          zIndex: 1000,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/images/Lukaria_logo_small.png"
            alt="Lukaria Logo"
            width={48}
            height={48}
            sx={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              display: { xs: 'none', sm: 'block' },
            }}
          />
          <Typography variant="h5" component="span" className="Svelte_logo">
            Svelte
          </Typography>
          <Typography variant="body1" component="span" className="svelte_post_script">
            by LuKaria
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!user && (
            <Button
              onClick={() => (window.location.href = '/api/auth/login')}
              variant="contained"
              startIcon={<Login />}
              sx={{
                textTransform: 'none',
                backgroundColor: '#36454F',
                color: '#877449',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
                '&:hover': { backgroundColor: '#2C3E50' },
              }}
            >
              Sign-up/Login
            </Button>
          )}

          {user && (
            <Button
              onClick={() => (window.location.href = `${process.env.AUTH0_BASE_URL}/api/auth/logout`)}
              variant="outlined"
              sx={{
                textTransform: 'none',
                borderColor: '#877449',
                color: '#877449',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
                '&:hover': {
                  borderColor: '#877449',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                },
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 14,
          mb: 0,
          backgroundColor: '#ffffff',
          py: 0,
          width: '100%',
          position: 'relative',
          display: 'flex',
          justifyContent: 'flex-end',
          px: 2,
        }}
      >
        <Box
          component="a"
          href="https://wa.me/18762903659"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 0,
            textDecoration: 'none',
            borderRadius: 1,
            backgroundColor: '#ffffff',
            zIndex: 100,
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <WhatsApp sx={{ fontSize: 28, color: '#25D366' }} />
          <Typography
            variant="body2"
            sx={{ color: '#25D366', fontWeight: 600, fontSize: '0.9rem' }}
          >
            876-290-3659
          </Typography>
        </Box>
      </Box>

      {children}

      <HomeBelowFold />
    </>
  );
}
