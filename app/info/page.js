'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
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
  Schedule,
  CheckCircle,
  LocalHospital,
  Description,
  Info as InfoIcon,
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
      </Box>

      {/* Main Content */}
        <Container maxWidth="lg" sx={{ mt: 18, mb: 6 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" gutterBottom sx={{ color: '#877449', fontFamily: 'sans-serif' }}>
              Payment Information
            </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Transparent pricing for your weight loss journey
          </Typography>
        </Box>

        <Grid container spacing={4}>
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
                  <Typography variant="h4" sx={{ color: '#877449', fontWeight: 'bold', mb: 1 }}>
                    $88,000/month
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Comprehensive Weight Loss Program
                  </Typography>
                  
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircle sx={{ color: '#877449' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Monthly physician consultation"
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
                        primary="24/7 support access"
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
                  </List>
                </Paper>

                <Paper elevation={3} sx={{ p: 2, backgroundColor: '#36454F', border: '1px solid #877449' }}>
                  <Typography variant="body2" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                    Limited time introductory offer (ends November 15)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#877449' }}>
                    • Free initial consultation ($8,000 value)<br />
                    • Lifetime medication discount of 10% ($8,000/month value)
                  </Typography>
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
                              Account Holder: KADRIA FAIRCLOUGH-STONE
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Bank Name: FCIB
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Branch: NEW KINGSTON
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Branch Transit: 09676
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Account Type: Chequing
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: '#877449' }}>
                              Account Number: 1002362428
                            </Typography>
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', color: '#877449', fontWeight: 600 }}
                      />
                    </ListItem>
                  </List>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                    <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Billing Schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    • Monthly subscription billed on the same day each month
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    • No long-term contracts required
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    • Cancel anytime with 30-day notice
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Automatic renewal for convenience
                  </Typography>
                </Box>

                <Paper elevation={3} sx={{ p: 2, backgroundColor: '#36454F' }}>
                  <Typography variant="body2" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                    <InfoIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                    Secure Payment Processing
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All payments are processed securely through our encrypted payment gateway. Your financial information is never stored on our servers.
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          {/* What's Included Card */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Description sx={{ fontSize: 40, color: '#877449', mr: 1 }} />
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: '600' }}>
                    What's Included in Your Subscription
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Medical Care
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly virtual consultations with licensed physicians who specialize in weight management.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Medications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        FDA-approved GLP-1 medications like Mounjaro, shipped directly to your door.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Support
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        24/7 access to our patient care team for questions and guidance throughout your journey.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Monitoring
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Regular health tracking and progress monitoring to ensure safe and effective weight loss.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Resources
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Access to nutrition guides, exercise plans, and educational materials.
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper elevation={2} sx={{ p: 2, backgroundColor: '#2C3E50', height: '100%' }}>
                      <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: '600', mb: 1 }}>
                        Premium Benefits
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Exclusive Svelte member perks, special offers, and priority support.
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
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

