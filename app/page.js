'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
      
      // Redirect to schedule page
      router.push('/schedule');
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
    return (
      <>
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading user: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  // Show redirect message for logged-in users
  if (user || shouldRedirect) {
    return (
      <>
        <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Redirecting to dashboard...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <Box
                  sx={{ 
          position: 'fixed',
                      top: 0,
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
                color: '#D4AF37',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
                          '&:hover': {
                  backgroundColor: '#2C3E50',
                          }
                        }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                          Login
                        </Box>
                      </Button>
          )}
          
          {user && (
                      <Button
              onClick={() => window.location.href = 'https://localhost:3000/api/auth/logout'}
                        variant="outlined"
                        sx={{ 
                          textTransform: 'none',
                borderColor: '#D4AF37',
                color: '#D4AF37',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
                          '&:hover': {
                  borderColor: '#D4AF37',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          }
                        }}
                      >
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                          Logout
                        </Box>
                      </Button>
          )}
        </Box>
                  </Box>

      {/* Heading under top bar - Full width */}
      <Box
        sx={{
          mt: 8,
          mb: 0,
          textAlign: 'center',
          backgroundColor: '#ffffff',
          py: 3,
          width: '100%'
        }}
      >
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
            {[0, 1, 2].map((page) => (
              <Box
                key={page}
                onClick={() => setCurrentPage(page)}
                sx={{ 
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: currentPage === page ? '#D4AF37' : '#ddd',
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
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
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
                        color: '#D4AF37',
                        borderColor: '#D4AF37',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: '600',
                        px: 2,
                        py: 1,
                        mt: 2,
                        width: 'auto',
                        alignSelf: 'center',
                        '&:hover': {
                          borderColor: '#D4AF37',
                          backgroundColor: 'rgba(212, 175, 55, 0.2)',
                          color: '#D4AF37'
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
                  <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D4AF37', zIndex: 1 }}>
                    <Typography variant="h6" className="Svelte_logo" sx={{ color: '#D4AF37', fontWeight: '600' }}>
                      Why Svelte?
                  </Typography>
                </Box>
                  
                  <Box sx={{ mb: 4, color: '#D4AF37', textAlign: 'left', maxWidth: '600px', mx: 'auto', mt: 10, position: 'relative', zIndex: 1 }}>
                 <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                     <strong>Convenient virtual platform.</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                     <strong>Physician guidance and monitoring.</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                     <strong>Familiar and trusted brands: Wegovy and Mounjaro.</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                     <strong>Medications delivered to convenient pickup locations in your parish.</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                     <strong>Flat monthly fee.</strong>
                   </Typography>
                   <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                     <strong>Exclusive membership with premium benefits at partner locations.</strong>
                   </Typography>
                 </Box>
                  </Box>
              
                  {/* Button container */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#D4AF37',
                        borderColor: '#D4AF37',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontWeight: '600',
                        width: 'auto',
                        '&:hover': {
                          borderColor: '#D4AF37',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          color: '#D4AF37'
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
                  <Box sx={{ position: 'absolute', top: 20, left: 20, right: 20, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #D4AF37', zIndex: 1 }}>
                    <Typography variant="h6" className="Svelte_logo" sx={{ color: '#D4AF37', fontWeight: '600' }}>
                      Exclusive Offers
                    </Typography>
                  </Box>
                  
                  {/* Exclusive offers bullet points */}
                  <Box sx={{ mb: 3, color: '#D4AF37', textAlign: 'left', maxWidth: '600px', mx: 'auto', mt: 10, position: 'relative', zIndex: 1 }}>
                    <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                      <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                        <strong>Get a free consult with a licensed physician</strong>
                      </Typography>
                      <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                        <strong>Receive a discount on your first 4 week supply of medication</strong>
                      </Typography>
                      <Typography component="li" variant="body1" sx={{ mb: 2, color: '#D4AF37', lineHeight: 1.6 }}>
                        <strong>Join our referral plan and get discounts when you refer a friend who starts the program</strong>
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Button container */}
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#D4AF37',
                        borderColor: '#D4AF37',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontWeight: '600',
                        width: 'auto',
                        '&:hover': {
                          borderColor: '#D4AF37',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                          color: '#D4AF37'
                        }
                      }}
                      onClick={() => setCurrentPage(1)}
                    >
                      Back
                    </Button>
                    
                    <Button
                      onClick={() => window.location.href = '/api/auth/login'}
                      variant="contained"
                      sx={{
                        backgroundColor: '#D4AF37',
                        color: '#000000',
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        fontWeight: '600',
                        width: 'auto',
                        '&:hover': {
                          backgroundColor: '#B8941F',
                          color: '#000000'
                        }
                      }}
                    >
                      Let's Start
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
                minWidth: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: '#333',
                zIndex: 10,
                fontSize: '1.2rem',
                    '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }
              }}
            >
              ←
                </Button>
          )}

          {currentPage < 2 && (
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              sx={{
                position: 'absolute',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.1)',
                color: '#333',
                zIndex: 10,
                fontSize: '1.2rem',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.2)'
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
