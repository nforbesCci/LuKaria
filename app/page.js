'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
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

export default function Home() {
  const { user, isLoading, error } = useUser();
  const [doctorPortraitSrc, setDoctorPortraitSrc] = useState('/images/kadria_no_background.png');
  const router = useRouter();

  // Redirect logged-in users without blocking marketing LCP for visitors
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
          <Alert severity="error">
            Authentication error: {error.message}
          </Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => window.location.href = '/api/auth/login'}
              sx={{
                backgroundColor: '#877449',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#6b5d3a',
                }
              }}
            >
              Try Login Again
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  // Session resolved and user is logged in — show brief redirect state (not while Auth0 is still loading)
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
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
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
        title="Medical Weight Loss Jamaica | Doctor-Guided Care | Svelte by LuKaria"
        description="Medical weight loss Jamaica with doctor-guided care. GLP-1 weight loss including Ozempic, Mounjaro and Tirzepatide. Physician-supervised virtual consultations. Flat monthly fee, no waiting rooms."
        keywords="medical weight loss Jamaica, doctor-guided care, GLP-1 weight loss, Ozempic Jamaica, Mounjaro Jamaica, Tirzepatide, Semaglutide, virtual weight loss clinic, telemedicine Jamaica, weight loss centre Jamaica, obesity treatment, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com"
      />
      <PublicTopMenu currentPath="/" />

      {/* Top Navigation Bar */}
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
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Logo and Title on the left */}
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
              display: { xs: 'none', sm: 'block' }
            }}
          />
          <Typography variant="h5" component="span" className="Svelte_logo">
            Svelte
                    </Typography>
          <Typography variant="body1" component="span" className="svelte_post_script">
            by LuKaria
                    </Typography>
        </Box>
                    
        {/* Login Button on the right */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Login Button */}
          {!user && (
                      <Button
              onClick={() => window.location.href = '/api/auth/login'}
                        variant="contained"
              startIcon={<Login />}
                        sx={{ 
                          textTransform: 'none',
                backgroundColor: '#36454F',
                color: '#877449',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
                          '&:hover': {
                  backgroundColor: '#2C3E50',
                          }
                        }}
                      >
                        Sign-up/Login
                      </Button>
          )}
          
          {user && (
                      <Button
              onClick={() => window.location.href = `${process.env.AUTH0_BASE_URL}/api/auth/logout`}
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
                          }
                        }}
                      >
                        Logout
                      </Button>
          )}
        </Box>
                  </Box>

      {/* Heading under top bar - Full width */}
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
        {/* WhatsApp Link - Right */}
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
            '&:hover': {
              backgroundColor: '#f5f5f5',
            }
          }}
        >
          <WhatsApp sx={{ 
            fontSize: 28, 
            color: '#25D366'
          }} />
          <Typography
            variant="body2"
            sx={{
              color: '#25D366',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            876-290-3659
          </Typography>
        </Box>
      </Box>

      {/* 1. Hero Section */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#faf8f5',
          pt: 0,
          pb: { xs: 4, md: 6 },
          px: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
          minHeight: { md: 480 },
        }}
      >
        <Box sx={{ flex: 1, maxWidth: { md: 520 }, order: { xs: 1, md: 1 } }}>
          <Typography component="h1" variant="h3" sx={{ color: '#000', fontWeight: 700, fontFamily: 'serif', mb: 2, fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } }}>
            Medically Supervised Weight Loss
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, fontSize: '1rem', lineHeight: 1.6 }}>
            Effective, physician-guided weight loss, including the use of GLP-1 medications (Ozempic, Wegovy, Tirzepatide).
          </Typography>
          <Button
            component="a"
            href="https://calendly.com/kadriaf-lukariagroup/30min"
            variant="contained"
            size="large"
            sx={{
              textTransform: 'none',
              backgroundColor: '#877449',
              color: '#000',
              fontWeight: 600,
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              mb: 0,
              '&:hover': { backgroundColor: '#B8941F' },
            }}
          >
            Start Your Svelte Journey
          </Button>
          <Typography variant="caption" sx={{ display: 'block', color: '#555', mt: 0.5, mb: 1 }}>
            Free no obligation consultation
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', fontStyle: 'italic' }}>
            Lose Weight & Feel Your Best with Svelte by LuKaria
          </Typography>
        </Box>
        <Box sx={{ flex: 1, maxWidth: { md: 480 }, display: 'flex', justifyContent: 'center', order: { xs: 0, md: 2 } }}>
          <Image
            src={doctorPortraitSrc}
            alt="Dr. Kadria Fairclough, physician for medical weight loss in Jamaica"
            width={400}
            height={400}
            priority
            sizes="(max-width: 900px) 100vw, 400px"
            style={{
              width: '100%',
              maxWidth: 400,
              height: 'auto',
              objectFit: 'contain',
            }}
            onError={() => setDoctorPortraitSrc('/images/kadria.png')}
          />
        </Box>
      </Box>

      {/* 2. Meet Your Doctor */}
      <Box sx={{ width: '100%', backgroundColor: '#f5f3ef', py: 6, px: 2 }}>
        <Container maxWidth="md">
          <Typography component="h2" variant="h4" sx={{ color: '#000', fontFamily: 'serif', fontWeight: 600, mb: 0.5 }}>
            Meet Your Doctor
          </Typography>
          <Typography component="h3" variant="h5" sx={{ color: '#000', fontWeight: 700, mb: 3 }}>
            Dr. Kadria Fairclough, Bsc, BMedSci, MBBS, LMCC.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 3 }}>
            <Box
              sx={{
                position: 'relative',
                width: { xs: 220, sm: 240 },
                height: { xs: 220, sm: 240 },
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <Image
                src={doctorPortraitSrc}
                alt="Dr. Kadria Fairclough, licensed physician"
                fill
                sizes="(max-width: 600px) 220px, 240px"
                fetchPriority="low"
                style={{ objectFit: 'cover', objectPosition: 'center 15%' }}
                onError={() => setDoctorPortraitSrc('/images/kadria.png')}
              />
            </Box>
            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.7 }}>
              Dr. Kadria Fairclough is a licensed physician with over 15 years of experience helping patients achieve their health and wellness goals. At Svelte by LuKaria, she specializes in medically supervised weight loss and GLP-1 treatments ensuring safe, effective, and personalized care.
            </Typography>
          </Box>
        </Container>
      </Box>

      <HomeBelowFold />
    </>
  );
}
