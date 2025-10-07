'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Login,
  Email,
  Phone,
  WhatsApp,
} from '@mui/icons-material';

export default function Contact() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }


  return (
    <>
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
            onClick={() => window.location.href = '/'}
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
          >
            Contact
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
          {!user && (
            <Box
              onClick={() => window.location.href = '/api/auth/login'}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                backgroundColor: '#36454F',
                color: '#877449',
                borderRadius: 1,
                cursor: 'pointer',
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: '64px' },
                '&:hover': {
                  backgroundColor: '#2C3E50',
                }
              }}
            >
              <Login sx={{ fontSize: 20 }} />
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                Login
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: '#000000', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 16, mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            textAlign="center" 
            sx={{ 
              color: '#877449',
              fontSize: '2rem',
              fontWeight: 400,
              fontFamily: 'Tahoma, sans-serif',
              mb: 4
            }}
          >
            Contact Us
          </Typography>

          <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
            <Box sx={{ 
              backgroundColor: '#36454F', 
              p: 0.625, 
              borderRadius: 2,
              mb: 3
            }}>
              <Email sx={{ 
                fontSize: 48, 
                color: '#877449', 
                mb: 2 
              }} />
              <Typography variant="h5" sx={{ 
                color: '#877449', 
                fontWeight: 600, 
                mb: 2 
              }}>
                Email Us
              </Typography>
              <Typography 
                variant="h6" 
                component="a"
                href="mailto:svelte@lukariagroup.com"
                sx={{ 
                  color: 'white',
                  fontFamily: 'monospace',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'block',
                  '&:hover': {
                    color: '#877449',
                    textDecoration: 'underline'
                  }
                }}
              >
                svelte@lukariagroup.com
              </Typography>
            </Box>

            <Box sx={{ 
              backgroundColor: '#36454F', 
              p: 0.625, 
              borderRadius: 2,
              mb: 3
            }}>
              <Phone sx={{ 
                fontSize: 48, 
                color: '#877449', 
                mb: 2 
              }} />
              <Typography variant="h5" sx={{ 
                color: '#877449', 
                fontWeight: 600, 
                mb: 2 
              }}>
                Call Us
              </Typography>
              <Typography 
                variant="h6" 
                component="a"
                href="tel:+18762903659"
                sx={{ 
                  color: 'white',
                  fontFamily: 'monospace',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'block',
                  '&:hover': {
                    color: '#877449',
                    textDecoration: 'underline'
                  }
                }}
              >
                876-290-3659
              </Typography>
            </Box>

            <Box sx={{ 
              backgroundColor: '#36454F', 
              p: 0.625, 
              borderRadius: 2
            }}>
              <WhatsApp sx={{ 
                fontSize: 48, 
                color: '#25D366', 
                mb: 2 
              }} />
              <Typography variant="h5" sx={{ 
                color: '#25D366', 
                fontWeight: 600, 
                mb: 2 
              }}>
                WhatsApp Us
              </Typography>
              <Typography 
                variant="h6" 
                component="a"
                href="https://wa.me/18762903659"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: 'white',
                  fontFamily: 'monospace',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  display: 'block',
                  '&:hover': {
                    color: '#25D366',
                    textDecoration: 'underline'
                  }
                }}
              >
                876-290-3659
              </Typography>
              <Typography variant="body2" sx={{ 
                color: '#877449', 
                mt: 2,
                fontStyle: 'italic'
              }}>
                Click to send a WhatsApp message
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
