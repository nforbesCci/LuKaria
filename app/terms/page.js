'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from '@mui/material';
import { Login } from '@mui/icons-material';

export default function Terms() {
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
            Terms and Conditions of Use
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Effective Date: October 15, 2025
          </Typography>

          <Typography variant="body1" paragraph>
            Welcome to Svelte by LuKaria ("Svelte", "we", "us", or "our"). Svelte is a virtual healthcare platform offering medically supervised weight loss services, including the prescription of GLP-1 medications, through a secure, cloud-based scheduling and electronic health records system. These Terms and Conditions of Use ("Terms") govern your access to and use of our website, mobile applications, telehealth services, and related features (collectively, the "Platform").
          </Typography>

          <Typography variant="body1" paragraph>
            By accessing or using Svelte by LuKaria, you agree to be bound by these Terms. If you do not agree, do not access or use the Platform.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ '& > *': { mb: 3 } }}>
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                1. Eligibility
              </Typography>
              <Typography variant="body1" paragraph>
                You must be at least 18 years old and reside in Jamaica, where we are authorized to provide telehealth services. By using the Platform, you represent and warrant that you meet these requirements.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                2. Not for Emergency Use
              </Typography>
              <Typography variant="body1" paragraph>
                Svelte by LuKaria is not a substitute for emergency medical care.
              </Typography>
              <Typography variant="body1" paragraph>
                If you are experiencing a medical emergency, call 911 or go to the nearest emergency room immediately. Do not use our services for urgent, life-threatening, or emergency conditions.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                3. Nature of Services
              </Typography>
              <Typography variant="body1" paragraph>
                Svelte provides:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Virtual consultations with licensed healthcare providers;</li>
                  <li>Access to a personalized weight loss plan;</li>
                  <li>Prescription and monitoring of GLP-1 medications when medically appropriate;</li>
                  <li>Use of a secure, cloud-based platform for scheduling, messaging, and storing health records.</li>
                </ul>
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Limitations of Virtual Care:
              </Typography>
              <Typography variant="body1" paragraph>
                Virtual medical services may not be appropriate for all conditions or circumstances. Our healthcare providers will determine the appropriateness of telehealth for your condition. You may be referred for in-person care if deemed necessary.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                4. No Medical Guarantee
              </Typography>
              <Typography variant="body1" paragraph>
                Use of our Platform does not guarantee a particular outcome. Weight loss results may vary based on individual health factors, adherence to the treatment plan, and other variables. No guarantees or warranties are made regarding the effectiveness of any treatment, including GLP-1 medications.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                5. Privacy and Security
              </Typography>
              <Typography variant="body1" paragraph>
                Your personal health information is protected in accordance with applicable HIPAA (Health Insurance Portability and Accountability Act) regulations. We use a secure, cloud-based system to manage scheduling, appointments, and electronic medical records.
              </Typography>
              <Typography variant="body1" paragraph>
                Please review our Privacy Policy for more information on how we collect, use, and protect your data.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                6. User Responsibilities
              </Typography>
              <Typography variant="body1" paragraph>
                You agree to:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Provide accurate, current, and complete health information;</li>
                  <li>Use the Platform only for lawful and intended purposes;</li>
                  <li>Not share your account credentials with others;</li>
                  <li>Follow the treatment plan and communicate any adverse effects or changes in your condition to your provider;</li>
                  <li>Not misuse the platform for purposes outside of legitimate medical care.</li>
                </ul>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                7. Prescriptions and Pharmacy Services
              </Typography>
              <Typography variant="body1" paragraph>
                Our providers may prescribe GLP-1 or other medications if medically appropriate. You understand that:
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Medication prescriptions are issued at the sole discretion of the healthcare provider;</li>
                  <li>You may be required to undergo lab testing or provide additional documentation before or during treatment;</li>
                  <li>Medication supply may be subject to availability, insurance coverage, and pharmacy limitations.</li>
                </ul>
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                8. Payment and Billing
              </Typography>
              <Typography variant="body1" paragraph>
                You are responsible for all charges associated with services provided through the Platform. This may include consultation fees, medication costs, and lab testing. You agree to provide valid payment information and authorize billing in accordance with our posted rates and billing policies.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                9. Intellectual Property
              </Typography>
              <Typography variant="body1" paragraph>
                All content, branding, and technology used by Svelte by LuKaria are the intellectual property of LuKaria, LLC or its licensors. You may not reproduce, distribute, or create derivative works without express written consent.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                10. Termination of Use
              </Typography>
              <Typography variant="body1" paragraph>
                We reserve the right to suspend or terminate your access to the Platform at our discretion, with or without cause, including but not limited to violations of these Terms.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                11. Limitation of Liability
              </Typography>
              <Typography variant="body1" paragraph>
                To the maximum extent permitted by law, Svelte by LuKaria and its affiliates, providers, and staff shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Platform, including but not limited to reliance on any medical advice or failure of telehealth services.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                12. Indemnification
              </Typography>
              <Typography variant="body1" paragraph>
                You agree to indemnify and hold harmless Svelte by LuKaria, its affiliates, and its personnel from and against any claims, damages, liabilities, and expenses arising from your misuse of the Platform or violation of these Terms.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                13. Governing Law
              </Typography>
              <Typography variant="body1" paragraph>
                These Terms shall be governed by and construed in accordance with the laws of Jamaica, without regard to its conflict of law principles.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                14. Changes to Terms
              </Typography>
              <Typography variant="body1" paragraph>
                We may update these Terms from time to time. Continued use of the Platform after such changes constitutes acceptance of the updated Terms. Please review this page periodically for updates.
              </Typography>
            </Box>

            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                15. Contact Information
              </Typography>
              <Typography variant="body1" paragraph>
                For questions about these Terms or our services, please contact:
              </Typography>
              <Typography variant="body1">
                Svelte by LuKaria<br />
                Email: svelte@lukariagroup.com<br />
                Phone: 876-290-3659<br />
                Website: www.lukariagroup.com
              </Typography>
            </Box>

            <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body1" paragraph sx={{ mb: 0 }}>
                By using this site, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions of Use.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

