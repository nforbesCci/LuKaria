'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Container,
  Typography,
  Box,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ExpandMore,
  Login,
} from '@mui/icons-material';

export default function FAQ() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState('ozempic');
  const [activeTab, setActiveTab] = useState(0); // Default to Mounjaro (index 0)

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
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
              textDecoration: 'underline'
            }}
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
      <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 16, mb: 4 }}>
          <Card sx={{ backgroundColor: '#000000', p: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              textAlign="center" 
              color="primary"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2.5rem' },
                fontWeight: 600,
                mb: 4,
                color: '#877449'
              }}
            >
              Frequently Asked Questions
            </Typography>

            {/* Tab Menu */}
            <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#877449',
                  },
                  '& .MuiTab-root': {
                    color: '#877449',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: '#877449',
                    },
                  },
                }}
              >
                <Tab label="Mounjaro" />
              </Tabs>
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Mounjaro Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Accordion 
                  expanded={expandedPanel === 'mounjaro-what'}
                  onChange={handleAccordionChange('mounjaro-what')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-what-content"
                    id="mounjaro-what-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      What is Mounjaro?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Mounjaro is a human-based glucagon-like peptide-1 receptor agonist and Glucose Dependent Insulinotropic Polypeptide (GIP) receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-how-works'}
                  onChange={handleAccordionChange('mounjaro-how-works')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-how-works-content"
                    id="mounjaro-how-works-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How does Mounjaro Work?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Mounjaro works by regulating your blood sugar and decreasing how much food you eat. Mounjaro also assists the body to store fat more efficiently.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-how-take'}
                  onChange={handleAccordionChange('mounjaro-how-take')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-how-take-content"
                    id="mounjaro-how-take-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How Do I Take Mounjaro?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Mounjaro is injected under the skin 1 time each week at any time of the day. It may be injected under the skin of the abdomen, thigh or back of the arm. You should alternate the injection site with each injection.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-weight-loss'}
                  onChange={handleAccordionChange('mounjaro-weight-loss')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-weight-loss-content"
                    id="mounjaro-weight-loss-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How much weight can I lose while taking Mounjaro?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Individual results may vary. In studies with Mounjaro adults were able to lose up to 22.5% of their body weight.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-side-effects'}
                  onChange={handleAccordionChange('mounjaro-side-effects')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-side-effects-content"
                    id="mounjaro-side-effects-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      What are the possible side effects of taking Mounjaro?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      The most common side effects include nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 2, color: 'white' }}>
                      You may also experience common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin (welting).
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 2, fontWeight: 600, color: 'white' }}>
                      More serious side effects are possible with use. Talk to your doctor about rare but serious side effects.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#2C3E50', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ color: '#877449', fontWeight: 600, textAlign: 'center' }}>
                    Let your doctor know if you take birth control pills or are having a surgery or other procedure involving anaesthesia.
                  </Typography>
                </Box>
              </Box>
            )}


            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
}
