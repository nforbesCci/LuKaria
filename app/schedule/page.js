'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentAppointment, setScheduleCompleted, completeSchedule, updatePreAppointmentTaskAction, checkAppointmentConfig } from '../../store/slices/appointmentSlice';
import { useScheduleRedirect } from '../../hooks/useScheduleProtection';
import { getSchedule } from '../../lib/api/appointmentService';
import {
  Container,
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import { CalendarToday } from '@mui/icons-material';

export default function Schedule() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state
  const scheduleCompleted = useAppSelector((state) => state.appointment.isScheduleCompleted);
  const currentAppointment = useAppSelector((state) => state.appointment.currentAppointment);
  const isScheduled = useAppSelector((state) => state.user.isScheduled);

  // Schedule redirect - prevent re-access to schedule page when already completed
  useScheduleRedirect();

  useEffect(() => {
    setMounted(true);
    
    // Check if schedule is already completed or user is scheduled - redirect if so
    if (scheduleCompleted || isScheduled) {
      router.push('/dashboard');
      return;
    }
    

  }, [router, scheduleCompleted, isScheduled]);

  // Load schedule data from database when page loads
  useEffect(() => {
    const loadScheduleFromDatabase = async () => {
      console.log('🔄 Schedule Page: useEffect triggered', { mounted, hasUser: !!user });
      
      if (!mounted || !user) {
        console.log('⏸️ Schedule Page: Skipping - not ready', { mounted, hasUser: !!user });
        return;
      }
      
      console.log('✅ Schedule Page: Starting database load');
      setLoadingSchedule(true);
      
      try {
        // Call the saga to check appointment configuration from database
        console.log('📤 Schedule Page: Dispatching checkAppointmentConfig');
        dispatch(checkAppointmentConfig());
        
        console.log('✅ Schedule Page: Dispatch successful');
      } catch (error) {
        console.error('❌ Schedule Page: Error loading schedule from database:', error);
      } finally {
        setTimeout(() => {
          setLoadingSchedule(false);
        }, 1000); // Give saga time to execute
      }
    };

    loadScheduleFromDatabase();
  }, [mounted, user, dispatch]);

  // Carepatron event listener
  useEffect(() => {
    // Only run this effect after component is mounted
    if (!mounted) return;

    function isCarepatronEvent(e) {
      return e.origin && e.origin.endsWith('carepatron.com') && e.data.event && e.data.event.indexOf("carepatron.") === 0;
    }

    window.addEventListener("message", function(e) {
      if (isCarepatronEvent(e)) {
        console.log("Carepatron Event Received:", e.data.event);
        // You can add logic here to handle specific events
        if (e.data.event === 'carepatron.date_and_time_selected') {
          // Perform actions when date and time are selected
        } else if (e.data.event === 'carepatron.booking.completed') {
          // Mark schedule as completed using saga
          console.log('Schedule completed - marking as done');
          console.log('Full appointment data:', e.data.payload);
          dispatch(completeSchedule(e.data.payload));
          // Redirect to dashboard
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("message", function(e) {
        if (isCarepatronEvent(e)) {
          console.log("Carepatron Event Received:", e.data.event);
          // You can add logic here to handle specific events
          if (e.data.event === 'carepatron.date_and_time_selected') {
            // Perform actions when date and time are selected
          } else if (e.data.event === 'carepatron.completed') {
            // Mark schedule as completed
            console.log('Schedule completed - marking as done');
            setScheduleCompleted(true);
          }
        }
      });
    };
  }, [mounted, router, dispatch]);

  // Prevent navigation away from schedule page until completed
  useEffect(() => {
    if (!scheduleCompleted) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'You must complete your schedule before leaving this page.';
        return 'You must complete your schedule before leaving this page.';
      };

      const handlePopState = (e) => {
        if (!scheduleCompleted) {
          window.history.pushState(null, '', window.location.pathname);
          e.preventDefault();
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('popstate', handlePopState);
      
      // Push initial state to prevent back button
      window.history.pushState(null, '', window.location.pathname);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [scheduleCompleted]);

  // Redirect to dashboard when schedule is completed
  useEffect(() => {
    if (scheduleCompleted) {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 2000); // Redirect after 2 seconds to show completion message

      return () => clearTimeout(timer);
    }
  }, [scheduleCompleted, router]);

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted || isLoading || loadingSchedule) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            {loadingSchedule ? 'Loading schedule data from database...' : 'Loading schedule...'}
          </Typography>
        </Container>
      </>
    );
  }

  // Redirect if user is already scheduled
  if (isScheduled || scheduleCompleted) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            You already have an appointment scheduled. Redirecting to dashboard...
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 8 }}>
          <Alert severity="error">
            Error loading schedule: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="xl" sx={{ mt: 8 }}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom color="primary">
              Access Denied
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Please log in to access the appointment scheduling system.
            </Typography>
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="xl" sx={{ mt: 8, mb: 4 }}>
        {/* Welcome Heading */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" className="Svelte_logo" sx={{ mb: 1 }}>
            Svelte
          </Typography>
          <Typography variant="h6" component="p" className="svelte_post_script">
            by LuKaria
          </Typography>
          <Typography variant="h5" component="h2" sx={{ mt: 2, color: 'primary.main', fontWeight: 500 }}>
            Welcome to Your Weight Loss Journey
          </Typography>
        </Box>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarToday sx={{ fontSize: { xs: 24, sm: 30 }, mr: 2, color: '#877449' }} />
            <Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                color="primary"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2.125rem' }
                }}
              >
                Schedule Appointment
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Book your telemedicine consultation with a licensed physician
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ overflow: 'hidden' }}>
          <Box 
            sx={{ 
              display: 'grid', 
              width: '100%', 
              height: '100%', 
              minWidth: '320px', 
              minHeight: '600px' 
            }}
          >
            <iframe 
              id="Carepatron Online Booking"
              title="Carepatron Online Booking" 
              alt="Book appointments online via Carepatron" 
              width="100%" 
              height="100%" 
              src="https://book.carepatron.com/Svelte-by-LuKaria/Kadria?p=r9RnLSo5RHyHR3fgw8hd.Q&s=OxGL.h4Z&i=PRIJX0DU&e=i" 
              style={{ border: 0 }}
            />
          </Box>
        </Paper>
        
        {/* Manual Automation Controls */}
        {scheduleCompleted && (
          <Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                🎉 Schedule Completed Successfully!
              </Typography>
              <Typography variant="body2">
                Your appointment has been scheduled. You will be redirected to the dashboard in a moment.
              </Typography>
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/dashboard'}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#877449',
                  '&:hover': {
                    backgroundColor: '#B8941F',
                  }
                }}
              >
                Go to Dashboard Now
              </Button>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Having trouble with the booking form? Try these options:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => {
                console.log("🔄 Refreshing iframe...");
                const iframe = document.getElementById("Carepatron Online Booking");
                if (iframe) {
                  iframe.src = iframe.src; // Refresh the iframe
                }
              }}
              sx={{ textTransform: 'none' }}
            >
              Refresh Booking Form
            </Button>
          </Box>
        </Box>
      </Container>
    </>
  );
}

