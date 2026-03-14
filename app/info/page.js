'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import SEO from '../../components/SEO';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  AttachMoney,
  CreditCard,
  CheckCircle,
  LocalHospital,
  Description,
  Info as InfoIcon,
  Login,
  LocalShipping,
  Payment,
} from '@mui/icons-material';

export default function InfoPage() {
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
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
        title="Pricing | Medical Weight Loss Jamaica | Svelte by LuKaria"
        description="Transparent pricing for medical weight loss Jamaica. Svelte by LuKaria GLP-1 weight loss program includes physician appointments, Ozempic, Mounjaro, Tirzepatide. Doctor-guided care with flat monthly fee."
        keywords="medical weight loss pricing Jamaica, GLP-1 weight loss cost, Ozempic Mounjaro price Jamaica, weight loss program cost, doctor-guided care pricing, affordable weight loss Jamaica, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com/info"
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
              textDecoration: 'underline'
            }}
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
          <Typography variant="body2" sx={{ color: '#000000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => window.location.href = '/blog'}>
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
                Sign-up/Login
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 18, mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                mb: 3,
                '&:hover': {
                  backgroundColor: '#B8941F',
                }
              }}
            >
              Book a No obligation appointment
            </Button>
          </Box>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ color: '#877449', fontFamily: 'sans-serif' }}>
              Membership and Pricing
            </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Transparent pricing for your weight loss journey
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* What's Included Card */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description sx={{ fontSize: 40, color: '#877449', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: '600' }}>
                    Svelte Member Benefits
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Medical Care
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#877449' }}>
                        Monthly virtual appointments with licensed physician.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Medications
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#877449' }}>
                        FDA-approved GLP-1 medications like Mounjaro, delivered to you.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Support
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#877449' }}>
                        Personalized guidance from our patient care team through out your journey.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Monitoring
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#877449' }}>
                        Regular health tracking and progress monitoring to ensure safe and effective weight loss.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Resources
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#877449' }}>
                        Access to nutritional and fitness support and educational materials.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Referral Program
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#877449' }}>
                        For each referral that starts the program receive an exclusive discount
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Pricing Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', backgroundColor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney sx={{ fontSize: 40, color: '#877449', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: '600' }}>
                    Pricing Plans
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                
                <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: '#2C3E50' }}>
                  <Typography variant="h4" sx={{ color: '#877449', fontWeight: 'bold', mb: 1, fontSize: '1.6rem' }}>
                    Comprehensive Weight Loss Program
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    All-inclusive monthly program
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Monthly physician appointments"
                        primaryTypographyProps={{ variant: 'body2', color: '#877449' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="GLP-1 medication included"
                        primaryTypographyProps={{ variant: 'body2', color: '#877449' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Free medication delivery"
                        primaryTypographyProps={{ variant: 'body2', color: '#877449' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Personalized treatment plan"
                        primaryTypographyProps={{ variant: 'body2', color: '#877449' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Flat monthly fee - does not change with changing dose"
                        primaryTypographyProps={{ variant: 'body2', color: '#877449' }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Discounts for Referring friends and family"
                        primaryTypographyProps={{ variant: 'body2', color: '#877449' }}
                      />
                    </ListItem>
                  </List>
                  
                  <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #877449' }}>
                    <Typography variant="h5" sx={{ color: '#877449', fontWeight: 'bold' }}>
                      
                    </Typography>
                  </Box>
                </Paper>

               
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Details Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', backgroundColor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CreditCard sx={{ fontSize: 40, color: '#877449', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: '600' }}>
                    Payment Details
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#877449' }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                    Accepted Payment Methods
                  </Typography>
                  <List dense>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Bank Transfer"
                        secondary={
                          <Box component="span" sx={{ display: 'block', mt: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Account Holder: LuKaria Professional Group Limited
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Bank Name: Scotiabank
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Branch: Constant Spring Road Branch
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Branch Transit: 21725
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Account Type: Chequing
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Account Number: 000081785
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', color: '#877449', fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        <LocalShipping sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Cash on Delivery"
                        secondary={
                          <Box component="span" sx={{ display: 'block', mt: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Pay with cash when your order is delivered
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', color: '#877449', fontWeight: 600 }}
                      />
                    </ListItem>
                    <ListItem sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        <Payment sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Credit Cards"
                        secondary={
                          <Box component="span" sx={{ display: 'block', mt: 1 }}>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              We accept all major credit cards.
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', color: '#877449', fontWeight: 600 }}
                      />
                    </ListItem>
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* CTA Section */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                textAlign: 'center', 
                backgroundColor: '#877449',
                backgroundImage: 'linear-gradient(135deg, #877449 0%, #B8941F 100%)'
              }}
            >
              <Typography variant="h5" sx={{ color: '#000', fontWeight: '600', mb: 3 }}>
                Ready to Start Your Weight Loss Journey?
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = '/api/auth/login'}
                sx={{
                  backgroundColor: '#000',
                  color: '#877449',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#2C3E50',
                  }
                }}
              >
                Get Started Today
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

