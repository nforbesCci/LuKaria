'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import SEO from '../../components/SEO';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { Login } from '@mui/icons-material';

export default function PrivacyPolicy() {
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
      <SEO 
        title="Privacy Policy | Svelte by LuKaria"
        description="Read Svelte by LuKaria's privacy policy. Learn how we protect your personal health information and maintain HIPAA compliance for our virtual weight loss clinic."
        keywords="privacy policy, HIPAA compliance, patient privacy, telehealth privacy, medical data protection, Jamaica, Kadria, Kadria Fairclough, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com/privacy-policy"
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

      <Container maxWidth="lg" sx={{ mt: 18, mb: 4 }}>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h3" gutterBottom color="primary" sx={{ mb: 3 }}>
            Privacy Policy
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Effective Date: October 15, 2025
          </Typography>

          <Typography variant="body1" paragraph>
            At Svelte by LuKaria, your privacy is a top priority. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our virtual medical weight loss services, including the prescription and delivery of GLP-1 medications. By accessing our platform or using our services, you agree to the terms of this Privacy Policy.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ '& > *': { mb: 3 } }}>
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                1. Information We Collect
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                a. Personal Information
              </Typography>
              <Typography variant="body1" paragraph>
                We collect personal details you provide when signing up or receiving services, including:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Full name</li>
                  <li>Date of birth</li>
                  <li>Contact information (email, phone number, address)</li>
                  <li>Medical history and current health information</li>
                  <li>Insurance details (if applicable)</li>
                  <li>Payment information</li>
                </ul>
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                b. Health Information
              </Typography>
              <Typography variant="body1" paragraph>
                As a healthcare provider, we collect and store protected health information (PHI) in compliance with the Health Insurance Portability and Accountability Act (HIPAA). This may include:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Diagnoses</li>
                  <li>Treatment plans</li>
                  <li>Prescriptions (including GLP-1 medications)</li>
                  <li>Progress reports and health outcomes</li>
                </ul>
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                c. Technical Information
              </Typography>
              <Typography variant="body1" paragraph>
                When you interact with our platform, we may collect:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Device type and operating system</li>
                  <li>IP address</li>
                  <li>Browser type</li>
                  <li>Usage data (pages visited, time on site, etc.)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                2. How We Use Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                We use your information to:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Provide personalized medical weight loss care</li>
                  <li>Prescribe and manage GLP-1 medications</li>
                  <li>Coordinate medication delivery</li>
                  <li>Monitor health progress and outcomes</li>
                  <li>Communicate with you regarding appointments, updates, and support</li>
                  <li>Comply with legal, regulatory, and clinical obligations</li>
                  <li>Improve our services, platform functionality, and user experience</li>
                </ul>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                3. How We Share Your Information
              </Typography>
              <Typography variant="body1" paragraph>
                We do not sell your personal or health information. We may share your data only with:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Healthcare professionals within Svelte by LuKaria for treatment and care coordination</li>
                  <li>Pharmacies and delivery partners for prescription fulfillment and medication delivery</li>
                  <li>Technology providers (e.g., hosting, payment processing) who support our platform, under strict confidentiality agreements</li>
                  <li>Regulatory authorities, when required by law (e.g., for public health, legal investigations, or audit purposes)</li>
                </ul>
              </Typography>
              <Typography variant="body1" paragraph>
                All third parties are required to protect your data in accordance with HIPAA and applicable privacy laws.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                4. Your Rights
              </Typography>
              <Typography variant="body1" paragraph>
                As a user, you have the right to:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Access your personal and health information</li>
                  <li>Request corrections to your records</li>
                  <li>Request deletion of non-essential information</li>
                  <li>Withdraw consent for non-essential communications</li>
                  <li>File a complaint if you believe your rights have been violated</li>
                </ul>
              </Typography>
              <Typography variant="body1" paragraph>
                To exercise any of these rights, contact us at svelte@lukariagroup.com.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                5. Data Security
              </Typography>
              <Typography variant="body1" paragraph>
                We use industry-standard encryption, secure servers, and privacy-by-design protocols to protect your data. Access to your PHI is limited to authorized personnel only. While we take every reasonable precaution, no method of transmission over the Internet is 100% secure.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                6. Telehealth-Specific Privacy
              </Typography>
              <Typography variant="body1" paragraph>
                As a virtual provider, all consultations, records, and communications are conducted via secure, HIPAA-compliant platforms. You are responsible for maintaining privacy on your end, such as using a private device and network for virtual appointments.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                7. Changes to This Policy
              </Typography>
              <Typography variant="body1" paragraph>
                We may update this Privacy Policy as our services evolve or as laws change. We will notify you of significant updates by email or through the platform. The revised policy will take effect immediately upon posting.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                8. Contact Us
              </Typography>
              <Typography variant="body1" paragraph>
                If you have questions about this Privacy Policy or how we handle your information, please contact:
              </Typography>
              <Typography variant="body1">
                Svelte by LuKaria<br />
                Email: svelte@lukariagroup.com<br />
                Phone: 876-290-3659
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

