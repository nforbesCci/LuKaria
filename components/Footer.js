'use client';

import { Box, Container, Typography, Stack, Divider } from '@mui/material';
import Link from 'next/link';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#000000',
        color: '#877449',
        mt: 'auto',
        borderTop: '1px solid rgba(135, 116, 73, 0.2)',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: 3
        }}>
          {/* Logo Section */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Box
              component="img"
              src="/images/Lukaria_logo_small.png"
              alt="Lukaria Logo"
              sx={{
                width: 60,
                height: 60,
                objectFit: 'contain'
              }}
            />
          </Box>

          {/* Links Section */}
          <Box sx={{ 
            display: 'flex', 
            gap: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            mt: '20px'
          }}>
            <Link href="/privacy-policy" passHref style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#877449',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#B8941F'
                  }
                }}
              >
                Privacy Policy
              </Typography>
            </Link>
            <Link href="/terms" passHref style={{ textDecoration: 'none' }}>
              <Typography
                variant="body2"
                sx={{
                  color: '#877449',
                  cursor: 'pointer',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: '#B8941F'
                  }
                }}
              >
                Terms of Service
              </Typography>
            </Link>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(135, 116, 73, 0.3)' }} />

        {/* Copyright */}
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#877449', opacity: 0.8 }}>
          © {new Date().getFullYear()} LuKaria. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

