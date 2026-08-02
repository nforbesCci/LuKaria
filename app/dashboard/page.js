'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Header from '../../components/Header';
import PageTitle from '../../components/PageTitle';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProfile } from '../../store/slices/profileSlice';
import { canAccessPage, useBasicAccess } from '../../hooks/useAccessControl';
import { useBookingUrl, DEFAULT_BOOKING_URL } from '../../hooks/useBookingUrl';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Login,
  Dashboard,
  Person,
  Description,
  Groups,
  MedicalServices,
  Scale,
  Medication,
  Restaurant,
  AdminPanelSettings,
  Schedule,
  Report,
  Settings,
  AccessibilityNew,
} from '@mui/icons-material';

export default function DashboardPage() {
  const { user, isLoading, error } = useUser();
  const dispatch = useAppDispatch();
  const profileState = useAppSelector((state) => state.profile);
  const { bookingUrl, bookingLabel } = useBookingUrl();

  // Access control - Admin, Doctor, or Patient
  useBasicAccess();

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const navigationCards = [
    ...(canAccessPage(user, 'basic', profileState.profile)
      ? [
          { text: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
          { text: 'Profile', path: '/profile', icon: <Person /> },
          {
            text: bookingLabel || 'Book an appointment',
            path: bookingUrl || DEFAULT_BOOKING_URL,
            icon: <Schedule />,
            external: true,
          },
          { text: 'Consent Forms', path: '/consent-forms', icon: <Description /> },
        ]
      : []),
    ...(canAccessPage(user, 'consultation', profileState.profile)
      ? [
          { text: 'Membership Area', path: '/membership', icon: <Groups /> },
          { text: 'Side Effects', path: '/side-effects', icon: <MedicalServices /> },
          { text: 'Weight Logging', path: '/weight-logging', icon: <Scale /> },
          { text: 'Body Scan', path: '/body-scan', icon: <AccessibilityNew /> },
          { text: 'Medication Tracker', path: '/medication-tracker', icon: <Medication /> },
          { text: 'Meal Tracker', path: '/meal-tracker', icon: <Restaurant /> },
        ]
      : []),
    ...(canAccessPage(user, 'admin', profileState.profile)
      ? [
          { text: 'Administration', path: '/admin', icon: <AdminPanelSettings /> },
          { text: 'Reschedule Requests', path: '/admin/reschedule-requests', icon: <Schedule /> },
          { text: 'Side Effects Reports', path: '/admin/side-effects', icon: <Report /> },
          { text: 'System Settings', path: '/admin/settings', icon: <Settings /> },
        ]
      : []),
  ].filter((item) => item.path !== '/dashboard');

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
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
        <Header />
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading user: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom color="primary">
              Access Denied
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Please log in to access the dashboard.
            </Typography>
            <Button
              href="/api/auth/login"
              variant="contained"
              size="large"
              startIcon={<Login />}
              sx={{ textTransform: 'none' }}
            >
              Log In
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <PageTitle
          title="Dashboard"
          subtitle={`Welcome to your dashboard, ${user.name}!`}
          showBackButton={false}
        />

        <Card sx={{ mb: 4, backgroundColor: '#1a1a1a' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, color: '#877449' }}>
              Quick Navigation
            </Typography>
            <Grid container spacing={2}>
              {navigationCards.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.path}>
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 180,
                      backgroundColor: '#83754b',
                      border: '1px solid rgba(135, 116, 73, 0.35)',
                    }}
                  >
                    <CardActionArea
                      component={item.external ? 'a' : Link}
                      href={item.path}
                      {...(item.external && {
                        target: '_blank',
                        rel: 'noopener noreferrer',
                      })}
                      sx={{
                        height: '100%',
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        '&:hover': { backgroundColor: 'rgba(212, 175, 55, 0.08)' },
                      }}
                    >
                      <Box sx={{ color: '#FFFFFF', mb: 1 }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1.5rem' }}
                        >
                          {item.text}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.external ? 'Open Calendly.' : `Open ${item.text.toLowerCase()}.`}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
