'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Header from '../../components/Header';
import WeightHeightEntry from '../../components/WeightHeightEntry';
import PrepareQuestions from '../../components/PrepareQuestions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentAppointment, loadAppointmentData, updatePreAppointmentTask, loadQuestions } from '../../store/slices/appointmentSlice';
import { fetchProfile } from '../../store/slices/profileSlice';
import { fetchMeasurements } from '../../store/slices/measurementsSlice';
import { useScheduleProtection } from '../../hooks/useScheduleProtection';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Warning,
  Login,
  PersonAdd,
  Visibility,
  CalendarToday,
  Assignment,
  CheckCircleOutline,
  Schedule,
  MedicalServices,
  Close,
} from '@mui/icons-material';

export default function Dashboard() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [showWeightHeightEntry, setShowWeightHeightEntry] = useState(false);
  const [showPrepareQuestions, setShowPrepareQuestions] = useState(false);
  
  // Redux state
  const currentAppointment = useAppSelector((state) => state.appointment.currentAppointment);
  const isScheduleCompleted = useAppSelector((state) => state.appointment.isScheduleCompleted);
  const isScheduled = useAppSelector((state) => state.user.isScheduled);
  const preAppointmentTasks = useAppSelector((state) => state.appointment.preAppointmentTasks);
  const questions = useAppSelector((state) => state.appointment.questions);
  const profileState = useAppSelector((state) => state.profile);
  const measurementsState = useAppSelector((state) => state.measurements);


  // Schedule protection - prevent access to dashboard if schedule not completed
  useScheduleProtection();

  useEffect(() => {
    setMounted(true);
    // Load appointment data using saga
    console.log('📊 Dashboard: Loading appointment data...');
    dispatch(loadAppointmentData());
    
    // Load questions data using saga
    console.log('📊 Dashboard: Loading questions data...');
    dispatch(loadQuestions());
    
    // Load profile data using saga
    console.log('📊 Dashboard: Loading profile data...');
    dispatch(fetchProfile());
    
    // Load measurements data using saga
    console.log('📊 Dashboard: Loading measurements data...');
    dispatch(fetchMeasurements());
  }, [dispatch]);

  // Debug: Log appointment data when it changes
  useEffect(() => {
    if (currentAppointment) {
      console.log('📅 Dashboard: Current appointment data:', currentAppointment);
      console.log('✅ Dashboard: isScheduled =', isScheduled);
      console.log('✅ Dashboard: isScheduleCompleted =', isScheduleCompleted);
    }
  }, [currentAppointment, isScheduled, isScheduleCompleted]);

  // Debug: Log profile data when it changes
  useEffect(() => {
    if (profileState.isLoaded && profileState.profile) {
      console.log('👤 Dashboard: Profile loaded successfully:', profileState.profile);
      
      // If profile exists, mark medical profile task as complete
      if (profileState.profile && profileState.profile.exists) {
        console.log('✅ Dashboard: Profile exists, marking medical profile task as complete');
        dispatch(updatePreAppointmentTask({ 
          taskKey: 'completeMedicalProfile', 
          completed: true 
        }));
      }
    }
    if (profileState.error) {
      console.log('❌ Dashboard: Profile load error:', profileState.error);
    }
  }, [profileState.isLoaded, profileState.profile, profileState.error, dispatch]);

  // Debug: Log measurements data when it changes
  useEffect(() => {
    if (measurementsState.isLoaded && measurementsState.measurements) {
      console.log('📏 Dashboard: Measurements loaded successfully:', measurementsState.measurements);
      
      // If measurements exist, mark weight/height task as complete
      if (measurementsState.measurements && measurementsState.measurements.exists) {
        console.log('✅ Dashboard: Measurements exist, marking weight/height task as complete');
        dispatch(updatePreAppointmentTask({ 
          taskKey: 'enterWeightHeight', 
          completed: true 
        }));
      }
    }
    if (measurementsState.error) {
      console.log('❌ Dashboard: Measurements load error:', measurementsState.error);
    }
  }, [measurementsState.isLoaded, measurementsState.measurements, measurementsState.error, dispatch]);

  // Debug: Log questions data when it changes
  useEffect(() => {
    if (questions) {
      console.log('❓ Dashboard: Questions data:', questions);
    }
  }, [questions]);

  // Debug: Log preAppointmentTasks state
  useEffect(() => {
    console.log('📋 Dashboard: Pre-appointment tasks state:', preAppointmentTasks);
  }, [preAppointmentTasks]);

  // Function to determine if prepareQuestions task is completed
  const isPrepareQuestionsCompleted = () => {
    if (!questions) return false;
    
    // Check if user has questions or explicitly marked "no questions"
    return (questions.questions && questions.questions.trim().length > 0) || 
           questions.noQuestions === true;
  };

  // Handler for weight/height entry completion
  const handleWeightHeightComplete = (data) => {
    // Mark the task as complete
    dispatch(updatePreAppointmentTask({ 
      taskKey: 'enterWeightHeight', 
      completed: true 
    }));
    
    // Hide the weight/height entry component
    setShowWeightHeightEntry(false);
    
    // In a real app, you might want to save the data to the backend
    console.log('Weight/Height data saved:', data);
  };

  // Handler for going back from weight/height entry
  const handleWeightHeightBack = () => {
    setShowWeightHeightEntry(false);
  };

  // Handler for prepare questions completion
  const handlePrepareQuestionsComplete = (data) => {
    // Note: Task completion is now determined by store state, not manually set
    // The isPrepareQuestionsCompleted() function will check if questions exist in store
    
    // Hide the prepare questions component
    setShowPrepareQuestions(false);
    
    // Log the completion
    console.log('Prepare Questions data saved:', data);
    console.log('Task completion will be determined by store state');
  };

  // Handler for going back from prepare questions
  const handlePrepareQuestionsBack = () => {
    setShowPrepareQuestions(false);
  };

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

  // Show WeightHeightEntry component if active
  if (showWeightHeightEntry) {
    return (
      <>
        <Header />
        <WeightHeightEntry
          onComplete={handleWeightHeightComplete}
          onBack={handleWeightHeightBack}
        />
      </>
    );
  }

  // Show PrepareQuestions component if active
  if (showPrepareQuestions) {
    return (
      <>
        <Header />
        <PrepareQuestions
          onComplete={handlePrepareQuestionsComplete}
          onBack={handlePrepareQuestionsBack}
        />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          textAlign="center" 
          color="primary"
          sx={{
            fontSize: { xs: '1.25rem', sm: '3rem' },
            fontWeight: 600
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="h5" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Welcome to your dashboard, {user.name}!
        </Typography>

        {/* Appointment Panel */}
        {currentAppointment && (
          <Card sx={{ mb: 4, backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ fontSize: 30, mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h5" gutterBottom color="primary">
                    Upcoming Appointment
                  </Typography>
                </Box>
              </Box>

              {/* Show appointment details if scheduled, otherwise show "not scheduled" message */}
              {isScheduled && currentAppointment ? (
                <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#2C3E50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {currentAppointment.type ? 
                        `${currentAppointment.type.toUpperCase()} Scheduled` : 
                        'CONSULTATION Scheduled'}
                    </Typography>
                    <Chip label="Confirmed" color="success" size="small" />
                  </Box>
                  
                  {/* Appointment Date & Time */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Date:</strong> {currentAppointment.date ? 
                      new Date(currentAppointment.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 
                      currentAppointment.startDate ?
                      new Date(currentAppointment.startDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) :
                      'To be confirmed'}
                  </Typography>
                  
                  {/* Appointment Time */}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Time:</strong> {currentAppointment.time || 
                      (currentAppointment.startDate ? 
                        new Date(currentAppointment.startDate).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 
                        'To be confirmed')}
                  </Typography>
                  
                  {/* Appointment Length */}
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Duration:</strong> {currentAppointment.length ? 
                      `${currentAppointment.length} minutes` : 
                      currentAppointment.endDate && currentAppointment.startDate ? 
                        `${Math.round((new Date(currentAppointment.endDate) - new Date(currentAppointment.startDate)) / (1000 * 60))} minutes` : 
                        '30 minutes'}
                  </Typography>
                  
                  {/* Scheduled At */}
                  {currentAppointment.scheduledAt && (
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                      Booked on: {new Date(currentAppointment.scheduledAt).toLocaleString()}
                    </Typography>
                  )}
                  
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        borderColor: '#877449',
                        color: '#877449',
                        '&:hover': {
                          borderColor: '#877449',
                          backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        }
                      }}
                    >
                      Reschedule
                    </Button>
                  </Box>
                </Paper>
              ) : (
                <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#2C3E50' }}>
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CalendarToday sx={{ fontSize: 48, color: '#877449', mb: 2 }} />
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      No Appointment Scheduled
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      You don't have any upcoming appointments
                    </Typography>
                    <Button
                      variant="contained"
                      component={Link}
                      href="/schedule"
                      sx={{
                        textTransform: 'none',
                        backgroundColor: '#877449',
                        color: '#000',
                        '&:hover': {
                          backgroundColor: '#B8941F',
                        }
                      }}
                    >
                      Schedule Appointment
                    </Button>
                  </Box>
                </Paper>
              )}

              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                <Assignment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Pre-Appointment Tasks
              </Typography>
              
              <Grid container spacing={2}>
                {[
                  {
                    key: 'completeMedicalProfile',
                    title: 'Complete Medical Profile',
                    description: 'Update your health information and medical history',
                    path: '/profile',
                    icon: <Person />
                  },
                  {
                    key: 'prepareQuestions',
                    title: 'Prepare Questions',
                    description: 'Write down any questions or concerns you\'d like to discuss',
                    path: '/profile',
                    icon: <Assignment />
                  },
                  {
                    key: 'testTechnology',
                    title: 'Test Your Technology',
                    description: 'Ensure your device and internet connection work properly',
                    path: '/schedule',
                    icon: <Schedule />
                  },
                  {
                    key: 'enterWeightHeight',
                    title: 'Enter Weight and Height',
                    description: 'Log your current weight and height measurements',
                    path: '/weight-logging',
                    icon: <Assignment />
                  }
                ].map((task) => (
                  <Grid item xs={12} sm={6} key={task.key}>
                    {task.key === 'enterWeightHeight' ? (
                      <Box
                        onClick={() => setShowWeightHeightEntry(true)}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            backgroundColor: 'rgba(212, 175, 55, 0.1)',
                            borderColor: '#877449'
                          }
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          {preAppointmentTasks[task.key] ? (
                            <CheckCircle sx={{ color: 'success.main' }} />
                          ) : (
                            <Close sx={{ color: 'error.main' }} />
                          )}
                        </Box>
                        <Box>
                          <Typography 
                            variant="subtitle1"
                            component="div"
                            sx={{
                              color: preAppointmentTasks[task.key] ? 'success.main' : 'error.main',
                              fontWeight: preAppointmentTasks[task.key] ? 'bold' : 'normal',
                              mb: 0.5
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Typography 
                            variant="body2"
                            component="div"
                            sx={{
                              color: preAppointmentTasks[task.key] ? 'success.dark' : 'error.dark'
                            }}
                          >
                            {task.description}
                          </Typography>
                        </Box>
                      </Box>
                    ) : task.key === 'prepareQuestions' ? (
                      <Box
                        onClick={() => setShowPrepareQuestions(true)}
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            backgroundColor: 'rgba(212, 175, 55, 0.1)',
                            borderColor: '#877449'
                          }
                        }}
                      >
                        <Box sx={{ mr: 2 }}>
                          {isPrepareQuestionsCompleted() ? (
                            <CheckCircle sx={{ color: 'success.main' }} />
                          ) : (
                            <Close sx={{ color: 'error.main' }} />
                          )}
                        </Box>
                        <Box>
                          <Typography 
                            variant="subtitle1"
                            component="div"
                            sx={{
                              color: isPrepareQuestionsCompleted() ? 'success.main' : 'error.main',
                              fontWeight: isPrepareQuestionsCompleted() ? 'bold' : 'normal',
                              mb: 0.5
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Typography 
                            variant="body2"
                            component="div"
                            sx={{
                              color: isPrepareQuestionsCompleted() ? 'success.dark' : 'error.dark'
                            }}
                          >
                            {task.description}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Link href={task.path} style={{ textDecoration: 'none' }}>
                        <Box
                          sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            p: 2,
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': {
                              backgroundColor: 'rgba(212, 175, 55, 0.1)',
                              borderColor: '#877449'
                            }
                          }}
                        >
                          <Box sx={{ mr: 2 }}>
                            {preAppointmentTasks[task.key] ? (
                              <CheckCircle sx={{ color: 'success.main' }} />
                            ) : (
                              <Close sx={{ color: 'error.main' }} />
                            )}
                          </Box>
                          <Box>
                            <Typography 
                              variant="subtitle1"
                              component="div"
                              sx={{
                                color: preAppointmentTasks[task.key] ? 'success.main' : 'error.main',
                                fontWeight: preAppointmentTasks[task.key] ? 'bold' : 'normal',
                                mb: 0.5
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Typography 
                              variant="body2"
                              component="div"
                              sx={{
                                color: preAppointmentTasks[task.key] ? 'success.dark' : 'error.dark'
                              }}
                            >
                              {task.description}
                            </Typography>
                          </Box>
                        </Box>
                      </Link>
                    )}
                  </Grid>
                ))}
              </Grid>

            </CardContent>
          </Card>
        )}
        

      </Container>
    </>
  );
}
