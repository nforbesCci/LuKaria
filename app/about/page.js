'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { Login } from '@mui/icons-material';

export default function AboutUs() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!mounted) {
    return null;
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
              textDecoration: 'underline'
            }}
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
              <Box>
                Login
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 18, mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ color: '#877449', fontFamily: 'sans-serif' }}>
            About Svelte by LuKaria
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Tabs - Desktop (Left Side) */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper elevation={2} sx={{ backgroundColor: '#1a1a1a', position: 'sticky', top: 120, height: 'fit-content' }}>
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  minHeight: 'auto',
                  '& .MuiTab-root': {
                    color: '#877449',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    py: 2,
                    px: 2,
                    minHeight: 'auto',
                    '&.Mui-selected': {
                      color: '#B8941F',
                      backgroundColor: '#2C3E50',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#877449',
                    width: 3,
                  },
                }}
              >
                <Tab label="MISSION" />
                <Tab label="Our Vision" />
                <Tab label="Our Approach" />
                <Tab label="Meet Dr. Kadria Fairclough" />
                <Tab label="Why Choose Us?" />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tabs - Mobile (Top) */}
          <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' } }}>
            <Paper elevation={2} sx={{ backgroundColor: '#1a1a1a' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: '#877449',
                    '&.Mui-selected': {
                      color: '#B8941F',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#877449',
                  },
                }}
              >
                <Tab label="MISSION" />
                <Tab label="Our Vision" />
                <Tab label="Our Approach" />
                <Tab label="Meet Dr. Kadria" />
                <Tab label="Why Choose Us?" />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tab Content */}
          <Grid item xs={12} md={9}>
            <Paper elevation={2} sx={{ p: 4, backgroundColor: '#1a1a1a', minHeight: 400 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    MISSION
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8 }}>
                    Svelte by LuKaria is a modern, virtual medical weight loss clinic dedicated to helping you become the healthiest version of yourself. We specialize in safe, clinically-proven weight loss using GLP-1 medications, delivered through a convenient, accessible online platform—so you can take control of your health on your terms.
                  </Typography>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Our Vision
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8 }}>
                    At Svelte by LuKaria, we believe that everyone deserves the opportunity to live a healthier, more vibrant life. Excess weight is more than just a number—it's a major risk factor for chronic illnesses such as diabetes, heart disease, and joint disorders. Our mission is to reduce those risks by making sustainable, medically supervised weight loss simple, personalized, and accessible—no matter where you are.
                  </Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Our Approach
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                    We combine evidence-based medicine with cutting-edge telehealth technology to deliver weight loss solutions that fit into your life. Using GLP-1 medications—proven to support appetite control and metabolic health—our team creates individualized treatment plans designed to help you shed weight safely and effectively, with ongoing support every step of the way.
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                    Our virtual model removes the barriers of traditional healthcare, offering you:
                  </Typography>
                  <Typography variant="body1" component="div" sx={{ color: '#877449', lineHeight: 1.8 }}>
                    <ul>
                      <li>Convenient online consultations</li>
                      <li>Personalized prescription plans</li>
                      <li>Continuous medical support and monitoring</li>
                      <li>Discreet, home-based care</li>
                    </ul>
                  </Typography>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Meet Dr. Kadria Fairclough
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' } }}>
                    <Box
                      component="img"
                      src="/images/kadria.png"
                      alt="Dr. Kadria Fairclough"
                      sx={{
                        width: { xs: '100%', md: 250 },
                        maxWidth: 250,
                        height: 'auto',
                        borderRadius: 2,
                        objectFit: 'cover',
                      }}
                    />
                    <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, flex: 1 }}>
                      Svelte by LuKaria was founded by Dr. Kadria Fairclough, a dedicated physician with a special interest in lifestyle medicine and obesity management. With a passion for transforming lives through science-backed, compassionate care, Dr. Fairclough created Svelte to empower individuals who are ready to make lasting changes to their health—without the stigma or complexity that often comes with weight loss.
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeTab === 4 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Why Choose Us?
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" component="div" sx={{ color: '#877449', lineHeight: 1.8, mb: 3 }}>
                    <ul>
                      <li>Science-first, patient-centered care</li>
                      <li>GLP-1 medications tailored to your needs</li>
                      <li>Fully virtual, no waiting rooms or long commutes</li>
                      <li>Support from a physician who truly understands the challenges of weight loss</li>
                    </ul>
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, fontStyle: 'italic' }}>
                    At Svelte by LuKaria, we're not just helping you lose weight—we're helping you reclaim your health, your confidence, and your future.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

