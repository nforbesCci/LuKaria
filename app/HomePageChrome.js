'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Script from 'next/script';
import SEO from '../components/SEO';
import { SITE_DEFAULT_TITLE, SITE_DEFAULT_DESCRIPTION } from '../lib/public-seo';
import PublicTopMenu from '../components/PublicTopMenu';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Login } from '@mui/icons-material';

/** Client shell: nav, auth redirect, analytics — LCP lives in server `children` */
export default function HomePageChrome({ children }) {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('home-scroll-snap');
    return () => root.classList.remove('home-scroll-snap');
  }, []);

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
        title={SITE_DEFAULT_TITLE}
        description={SITE_DEFAULT_DESCRIPTION}
        keywords="weight loss Jamaica, physician-supervised weight loss, GLP-1 Jamaica, Ozempic Jamaica, Mounjaro Jamaica, Tirzepatide, medical weight loss Jamaica, virtual weight loss clinic, telemedicine Jamaica, free consultation, Dr. Kadria Fairclough"
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
      
      </Box>

      {children}
    </>
  );
}
