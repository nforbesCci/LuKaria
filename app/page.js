'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Script from 'next/script';
import SEO from '../components/SEO';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Login,
  Person,
  Dashboard,
  LocalPharmacy,
  VideoCall,
  HealthAndSafety,
  CheckCircle,
  Star,
  Security,
  Speed,
  WhatsApp,
  ChatBubbleOutline,
  Medication,
  Assignment,
} from '@mui/icons-material';

export default function Home() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const router = useRouter();

  useEffect(() => {
      setMounted(true);
  }, []);

  // Handle redirect after component is mounted to prevent hydration issues
  useEffect(() => {
    if (mounted && user && !shouldRedirect) {
      setShouldRedirect(true);
      
      // Get user groups
      const userGroups = user.groups || user['https://lukariagroup.com/roles'] || [];
      console.log('🔐 Login Redirect - User groups:', userGroups);
      
      // Check if user is ONLY in Doctor group (not Admin or Patient)
      const isOnlyDoctor = userGroups.includes('Doctor') && 
                          !userGroups.includes('Admin') && 
                          !userGroups.includes('Patient');
      
      if (isOnlyDoctor) {
        console.log('👨‍⚕️ User is Doctor only - redirecting to Administration');
        router.push('/admin');
      } else {
        console.log('👤 User is Patient/Admin - redirecting to Dashboard');
        router.push('/dashboard');
      }
    }
  }, [user, mounted, router, shouldRedirect]);


  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <>
        <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading...
          </Typography>
        </Container>
      </>
    );
  }

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

  // Show redirect message for logged-in users
  if (user || shouldRedirect) {
    const userGroups = user?.groups || user?.['https://lukariagroup.com/roles'] || [];
    const isOnlyDoctor = userGroups.includes('Doctor') && 
                        !userGroups.includes('Admin') && 
                        !userGroups.includes('Patient');
    
    return (
      <>
        <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {isOnlyDoctor ? 'Redirecting to Administration...' : 'Redirecting to Dashboard...'}
          </Typography>
        </Container>
      </>
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
      {/* Navigation Menu */}
      <Box
        sx={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: '#877449',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          zIndex: 1001,
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#000000', 
              fontWeight: '600',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Home
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#000000', 
              fontWeight: '600',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => window.location.href = '/info'}
          >
            Info
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#000000', 
              fontWeight: '600',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => window.location.href = '/faq'}
          >
            FAQ
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#000000', 
              fontWeight: '600',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => window.location.href = '/contact'}
          >
            Contact
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#000000', 
              fontWeight: '600',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => window.location.href = '/about'}
          >
            About Us
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#000000', 
              fontWeight: '600',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={() => window.location.href = '/blog'}
          >
            Blog
          </Typography>
        </Box>
      </Box>

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
          <Box
            component="img"
            src="/images/kadria_no_background.png"
            alt="Dr. Kadria Fairclough"
            width={400}
            height={400}
            sx={{
              width: '100%',
              maxWidth: 400,
              height: 'auto',
              objectFit: 'contain',
            }}
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/kadria.png'; }}
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
              component="img"
              src="/images/kadria_no_background.png"
              alt="Dr. Kadria Fairclough"
              width={240}
              height={240}
              sx={{
                width: { xs: 220, sm: 240 },
                height: { xs: 220, sm: 240 },
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center 15%',
                flexShrink: 0,
              }}
              onError={(e) => { e.target.onerror = null; e.target.src = '/images/kadria.png'; }}
            />
            <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.7 }}>
              Dr. Kadria Fairclough is a licensed physician with over 15 years of experience helping patients achieve their health and wellness goals. At Svelte by LuKaria, she specializes in medically supervised weight loss and GLP-1 treatments ensuring safe, effective, and personalized care.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* 3. How the Program Works */}
      <Box sx={{ width: '100%', backgroundColor: '#faf8f5', py: 6, px: 2 }}>
        <Container maxWidth="lg">
          <Typography component="h2" variant="h4" sx={{ color: '#000', fontFamily: 'serif', fontWeight: 600, textAlign: 'center', mb: 4 }}>
            How the Program Works
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <ChatBubbleOutline sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>1-on-1 Consultation</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Discuss your health history, weight loss goals, and develop a personalized plan that fits your needs.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <Medication sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>GLP-1 Medication</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Access to FDA-approved GLP-1 medications like Ozempic, Wegovy, and tirzepatide (if appropriate) to support your weight loss.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <HealthAndSafety sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>Ongoing Support</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Receive continuous monitoring, guidance, and encouragement to ensure safe and effective results.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <VideoCall sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>Virtual Appointments</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Convenient secure virtual check-ins with Dr. Fairclough from the comfort of your home.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. Final CTA */}
      <Box sx={{ width: '100%', backgroundColor: '#f5f3ef', py: 6, px: 2, position: 'relative' }}>
        <Container maxWidth="md">
          <Typography component="h2" variant="h4" sx={{ color: '#000', fontFamily: 'serif', fontWeight: 700, textAlign: 'center', mb: 1 }}>
            Ready To Transform Your Health? Start Your Svelte Journey Today!
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', textAlign: 'center', mb: 4 }}>
            Schedule your initial consultation and begin your medically guided weight loss journey now.
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Security sx={{ fontSize: 32, color: '#877449', mt: 0.25 }} />
                  <Box>
                    <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>Clinically Proven</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      Safe and effective GLP-1 medications, backed by research.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Assignment sx={{ fontSize: 32, color: '#877449', mt: 0.25 }} />
                  <Box>
                    <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>Ongoing Monitoring</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      Regular follow-up and adjustments for optimal weight loss results.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center' }}>
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
                '&:hover': { backgroundColor: '#B8941F' },
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>
      </Box>
    </>
  );
}
