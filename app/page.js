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
} from '@mui/icons-material';

export default function Home() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // Start with page 0
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
        title="Svelte by LuKaria - Virtual Medical Weight Loss | GLP-1 Medications"
        description="Virtual medical weight loss clinic in Jamaica. GLP-1 medications like Mounjaro prescribed by licensed physicians. Flat monthly fee, no waiting rooms. Start your transformation today."
        keywords="weight loss Jamaica, GLP-1 medications, Mounjaro, virtual weight loss clinic, telemedicine Jamaica, online doctor, medical weight loss, obesity treatment, Kadria, Kadria Fairclough, Dr. Kadria Fairclough"
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
          textAlign: 'center',
          backgroundColor: '#ffffff',
          py: 3,
          width: '100%',
          position: 'relative'
        }}
      >
        {/* WhatsApp Link - Top Right */}
        <Box
          component="a"
          href="https://wa.me/18762903659"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
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
              display: { xs: 'none', sm: 'block' }
            }}
          >
            876-290-3659
          </Typography>
        </Box>
      </Box>

      {/* Book a Consult Link - Above Carousel */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#ffffff',
          py: 3,
          textAlign: 'center',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 1.5, sm: 2 }
        }}
      >
        <Button
          component="a"
          href="https://calendly.com/kadriaf-lukariagroup"
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          sx={{
            textTransform: 'none',
            backgroundColor: '#877449',
            color: '#000000',
            fontSize: '1.1rem',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            '&:hover': {
              backgroundColor: '#B8941F',
            }
          }}
        >
          Book a No obligation appointment
        </Button>
      </Box>

      {/* Lightbox - Full width */}
      <Box
                  sx={{ 
          width: '100%',
          height: '600px',
          backgroundColor: '#ffffff',
                    position: 'relative',
          overflow: 'hidden'
        }}
      >
          {/* Navigation Dots - Top */}
          <Box
            sx={{ 
              position: 'absolute',
              top: 5,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: 10
            }}
          >
            {[0, 1, 2, 3].map((page) => (
              <Box
                key={page}
                onClick={() => setCurrentPage(page)}
                sx={{ 
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: currentPage === page ? '#877449' : '#ddd',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </Box>

          {/* Lightbox Content */}
          <Box
            sx={{
              width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
              alignItems: 'center',
                    justifyContent: 'center',
              p: 2,
              textAlign: 'center',
              position: 'relative'
            }}
          >
            {currentPage === 0 && (
              <Box sx={{ width: '100%', height: 'calc(100% + 20px)', display: 'flex', gap: 2, p: 2 }}>
                {/* Left Panel - Content */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  backgroundColor: { xs: 'rgba(0, 0, 0, 0.8)', md: '#000000' },
                  backgroundImage: { xs: 'url(/images/weightloss1.png)', md: 'none' },
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  p: 4, 
                  borderRadius: 2,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.6)', md: 'transparent' },
                    borderRadius: 2,
                    zIndex: 0,
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2, position: 'relative', zIndex: 1 }}>
                    <span className="MuiTypography-root MuiTypography-h1 Svelte_large css-14vokww-MuiTypography-root" style={{ color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      Svelte
                    </span>
                    <span className="MuiTypography-root MuiTypography-body1 svelte_post_script css-1r5vudv-MuiTypography-root" style={{ marginTop: '210px', textAlign: 'center', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      by LuKaria
                    </span>
                  </Box>
                  <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span 
                      className="MuiTypography-root MuiTypography-body1 svelte_post_script css-1r5vudv-MuiTypography-root" 
                      style={{ 
                        fontStyle: 'italic',
                        display: 'block',
                        mb: 2,
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        textAlign: 'center'
                      }}
                    >
                      "Slender and elegantly slim"
                    </span>
                    <span 
                      className="MuiTypography-root MuiTypography-body1 svelte_post_script css-1r5vudv-MuiTypography-root" 
                      style={{ 
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        display: 'block',
                        mb: 2,
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        textAlign: 'center'
                      }}
                    >
                      Your Weight Loss Journey Redefined
                    </span>
                    <span 
                      className="MuiTypography-root MuiTypography-body1 svelte_post_script css-1r5vudv-MuiTypography-root" 
                      style={{ 
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        maxWidth: '300px',
                        display: 'block',
                        mb: 3,
                        margin: '0 auto',
                        color: 'white',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                      }}
                    >
                      Are you ready to get started on your expertly curated weight loss journey
                    </span>
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#877449',
                        borderColor: '#877449',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        px: 2,
                        py: 1,
                        mt: 2,
                        width: 'auto',
                        alignSelf: 'center',
                        display: { xs: 'none', md: 'block' },
                        '&:hover': {
                          borderColor: '#877449',
                          backgroundColor: 'rgba(212, 175, 55, 0.2)',
                          color: '#877449'
                        }
                      }}
                      onClick={() => setCurrentPage(1)}
                    >
                      Continue
                    </Button>
                  </Box>
                </Box>

                {/* Right Panel - Background Image */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundImage: 'url(/images/weightloss1.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: 2,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      zIndex: 1,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      px: 3
                    }}
                  >
                    Start Your Weight Loss Journey Today
                  </Typography>
                </Box>
              </Box>
            )}

            {currentPage === 1 && (
              <Box sx={{ width: '100%', height: 'calc(100% + 20px)', display: 'flex', gap: 2, p: 2 }}>
                {/* Left Panel - Content */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  backgroundColor: { xs: 'rgba(0, 0, 0, 0.8)', md: '#000000' },
                  backgroundImage: { xs: 'url(/images/weightloss4.png)', md: 'none' },
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  p: 4, 
                  borderRadius: 2, 
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.6)', md: 'transparent' },
                    borderRadius: 2,
                    zIndex: 0,
                  }
                }}>
                  {/* Header */}
                  <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #877449', zIndex: 1 }}>
                    <Typography variant="h6" className="Svelte_logo" sx={{ color: '#877449', fontWeight: '600' }}>
                      Why Svelte?
                  </Typography>
                </Box>
                  
                  <Box sx={{ mb: 4, color: '#877449', textAlign: 'left', maxWidth: '600px', mx: 'auto', mt: 10, position: 'relative', zIndex: 1 }}>
                 <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#877449', lineHeight: 1.6 }}>
                     <strong>Convenient virtual platform</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#877449', lineHeight: 1.6 }}>
                     <strong>Physician guidance and monitoring</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#877449', lineHeight: 1.6 }}>
                     <strong>Familiar and trusted brands like Mounjaro</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#877449', lineHeight: 1.6 }}>
                     <strong>Medications delivered to you</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#877449', lineHeight: 1.6 }}>
                     <strong>Flat monthly fee - does not change with changing dose</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#877449', lineHeight: 1.6 }}>
                     <strong>Exclusive Svelte membership with special offers and premium benefits</strong>
                   </Typography>
                 </Box>
                  </Box>
              
                  {/* Button container */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#877449',
                        borderColor: '#877449',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontWeight: '600',
                        width: 'auto',
                        display: { xs: 'none', sm: 'block' },
                        '&:hover': {
                          borderColor: '#877449',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          color: '#877449'
                        }
                      }}
                      onClick={() => setCurrentPage(2)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>

                {/* Right Panel - Background Image */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundImage: 'url(/images/weightloss4.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: 2,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      zIndex: 1,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      px: 3
                    }}
                  >
                    Why Choose Svelte?
                  </Typography>
                </Box>
              </Box>
            )}

            {currentPage === 2 && (
              <Box sx={{ width: '100%', height: 'calc(100% + 20px)', display: 'flex', gap: 2, p: 2 }}>
                {/* Left Panel - Content */}
                <Box sx={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  backgroundColor: { xs: 'rgba(0, 0, 0, 0.8)', md: '#000000' },
                  backgroundImage: { xs: 'url(/images/weightloss2.jpg)', md: 'none' },
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  p: 4, 
                  borderRadius: 2, 
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.6)', md: 'transparent' },
                    borderRadius: 2,
                    zIndex: 0,
                  }
                }}>
                  {/* Header */}
                  <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #877449', zIndex: 1 }}>
                    <Typography variant="h6" className="Svelte_logo" sx={{ color: '#877449', fontWeight: '600' }}>
                      Exclusive Offers
                    </Typography>
                  </Box>
                  
                  {/* Limited time offer text */}
                  <Box sx={{ mb: 2, color: '#877449', textAlign: 'center', maxWidth: '600px', mx: 'auto', mt: 10, position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600', fontSize: '1.1rem' }}>
                      Limited Time Introductory Offers
                    </Typography>
                  </Box>
                  
                  {/* Exclusive offers bullet points */}
                  <Box sx={{ mb: 3, color: '#877449', textAlign: 'left', maxWidth: '600px', mx: 'auto', position: 'relative', zIndex: 1 }}>
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      <Typography component="li" variant="body1" sx={{ mb: { xs: 1.25, sm: 2 }, color: '#877449', lineHeight: 1.6 }}>
                        <strong>50% off consultation fees with our physician </strong>
                      </Typography>
                      <Typography component="li" variant="body1" sx={{ mb: { xs: 1.25, sm: 2 }, color: '#877449', lineHeight: 1.6 }}>
                        <strong>Receive a discount on your first 4 week supply of medication</strong>
                      </Typography>
                      <Typography component="li" variant="body1" sx={{ mb: { xs: 1.25, sm: 2 }, color: '#877449', lineHeight: 1.6 }}>
                        <strong>Svelte referral program- receive premium benefits just for referring others</strong>
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Navigation button */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setCurrentPage(3)}
                      sx={{
                        borderColor: '#877449',
                        color: '#877449',
                        textTransform: 'none',
                        px: 3,
                        py: 1.25,
                        fontWeight: '600',
                        width: 'auto',
                        '&:hover': {
                          borderColor: '#877449',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          color: '#877449'
                        }
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>

                {/* Right Panel - Background Image */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundImage: 'url(/images/weightloss2.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: 2,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                    }
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      zIndex: 1,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      px: 3
                    }}
                  >
                    Start Your Journey Today
                  </Typography>
                </Box>
              </Box>
            )}

            {currentPage === 3 && (
              <Box sx={{ width: '100%', height: 'calc(100% + 20px)', display: 'flex', gap: 2, p: 2 }}>
                {/* Left Panel - Content */}
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundColor: { xs: 'rgba(0, 0, 0, 0.85)', md: '#000000' },
                    backgroundImage: { xs: 'none', md: 'none' },
                    backgroundSize: { xs: '400px 600px', md: 'auto' },
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    p: 4,
                    borderRadius: 2,
                    position: 'relative',
                    color: '#877449',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: { xs: 'rgba(0, 0, 0, 0.7)', md: 'transparent' },
                      borderRadius: 2,
                      zIndex: 0,
                    },
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 540 }}>
                    <Box
                      sx={{
                        border: '1px solid #877449',
                        borderRadius: 1,
                        width: 'calc(100% - 40px)',
                        maxWidth: 500,
                        px: 3,
                        py: 1.5,
                        mx: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        mb: 3,
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          color: '#877449',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                          fontFamily: '"Alex Brush", cursive',
                          fontSize: { xs: '1.4rem', sm: '2.125rem' },
                        }}
                      >
                        How do I get started?
                      </Typography>
                    </Box>
                    <Stack spacing={2} alignItems="center">
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.88rem', sm: '1.1rem' },
                          fontWeight: 500,
                          color: '#877449',
                        }}
                      >
                        Browse through the site tabs to learn more about Svelte.
                      </Typography>
                      <Typography component="div" sx={{ fontSize: { xs: '1.12rem', sm: '1.4rem' }, color: '#877449' }}>⬇️</Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.88rem', sm: '1.1rem' },
                          fontWeight: 500,
                          color: '#877449',
                        }}
                      >
                        Login to schedule your consultation.
                      </Typography>
                      <Typography component="div" sx={{ fontSize: { xs: '1.12rem', sm: '1.4rem' }, color: '#877449' }}>⬇️</Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.88rem', sm: '1.1rem' },
                          fontWeight: 500,
                          color: '#877449',
                        }}
                      >
                        Speak with a physician to decide if a Svelte membership is right for you.
                      </Typography>
                      <Typography component="div" sx={{ fontSize: { xs: '1.12rem', sm: '1.4rem' }, color: '#877449' }}>⬇️</Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: { xs: '0.88rem', sm: '1.1rem' },
                          fontWeight: 500,
                          color: '#877449',
                        }}
                      >
                        Start your personalized weight loss journey and enjoy the benefits of Svelte membership.
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      onClick={() => (window.location.href = '/api/auth/login')}
                      sx={{
                        mt: 4,
                        textTransform: 'none',
                        backgroundColor: '#877449',
                        color: '#000',
                        fontWeight: 600,
                        px: 3,
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#B8941F',
                        },
                      }}
                    >
                      Schedule Your Consultation
                    </Button>
                  </Box>
                </Box>

                {/* Right Panel - Background Image */}
                <Box
                  sx={{
                    flex: 1,
                    backgroundImage: 'url(/images/weightloss5.png)',
                    backgroundSize: '400px 600px',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    borderRadius: 2,
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: 2,
                    },
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      zIndex: 1,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                      px: 3,
                    }}
                  >
                    Your next step begins here.
                  </Typography>
                </Box>
              </Box>
            )}

          </Box>

              
          {/* Navigation Arrows */}
          {currentPage > 0 && (
                <Button
              onClick={() => setCurrentPage(currentPage - 1)}
                  sx={{ 
                position: 'absolute',
                left: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'white',
                color: '#877449',
                zIndex: 10,
                fontSize: '1.2rem',
                    '&:hover': {
                  backgroundColor: 'white'
                }
              }}
            >
              ←
                </Button>
          )}

          {currentPage < 3 && (
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#2b2b2b',
                color: 'white',
                zIndex: 10,
                fontSize: '1.2rem',
                '&:hover': {
                  backgroundColor: '#2b2b2b'
                }
              }}
            >
              →
            </Button>
          )}
          </Box>
    </>
  );
}
