'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Header from '../../components/Header';
import WeightHeightEntry from '../../components/WeightHeightEntry';
import PrepareQuestions from '../../components/PrepareQuestions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setCurrentAppointment, loadAppointmentData, updatePreAppointmentTask } from '../../store/slices/appointmentSlice';
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
  Dashboard as DashboardIcon,
  Home,
  Person,
  CheckCircle,
  Warning,
  Notifications,
  Security,
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
  const preAppointmentTasks = useAppSelector((state) => state.appointment.preAppointmentTasks);

  // Schedule protection - prevent access to dashboard if schedule not completed
  useScheduleProtection();

  useEffect(() => {
    setMounted(true);
    // Load appointment data using saga
    dispatch(loadAppointmentData());
  }, [dispatch]);

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
    // Mark the task as complete
    dispatch(updatePreAppointmentTask({ 
      taskKey: 'prepareQuestions', 
      completed: true 
    }));
    
    // Hide the prepare questions component
    setShowPrepareQuestions(false);
    
    // In a real app, you might want to save the data to the backend
    console.log('Prepare Questions data saved:', data);
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

              <Paper elevation={1} sx={{ p: 3, mb: 3, backgroundColor: '#2C3E50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">
                    Consultation Scheduled
                  </Typography>
                  <Chip label="Confirmed" color="success" size="small" />
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Date & Time:</strong> {currentAppointment.startDate ? 
                    new Date(currentAppointment.startDate).toLocaleString() + 
                    (currentAppointment.endDate ? 
                      ' (' + Math.round((new Date(currentAppointment.endDate) - new Date(currentAppointment.startDate)) / (1000 * 60)) + ' Minutes)' : 
                      ' (30 Minutes)') : 
                    'To be confirmed'}
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      textTransform: 'none',
                      borderColor: '#D4AF37',
                      color: '#D4AF37',
                      '&:hover': {
                        borderColor: '#D4AF37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      }
                    }}
                  >
                    Reschedule
                  </Button>
                </Box>
              </Paper>

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
                            borderColor: '#D4AF37'
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
                            borderColor: '#D4AF37'
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
                              borderColor: '#D4AF37'
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
        
        <Grid container spacing={3}>
          {/* Quick Stats */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        color: 'white',
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                        1
                      </Typography>
                      <Typography variant="body1">
                        Active Sessions
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                        color: 'white',
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                        <CheckCircle sx={{ fontSize: 'inherit' }} />
                      </Typography>
                      <Typography variant="body1">
                        Account Status
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                        color: 'white',
                      }}
                    >
                      <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                        <Notifications sx={{ fontSize: 'inherit' }} />
                      </Typography>
                      <Typography variant="body1">
                        Notifications
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Security color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Successfully logged in via Auth0"
                      secondary="Just now"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Profile information loaded"
                      secondary="Just now"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DashboardIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dashboard accessed"
                      secondary="Just now"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Email Status
                    </Typography>
                    <Chip
                      icon={user.email_verified ? <CheckCircle /> : <Warning />}
                      label={user.email_verified ? 'Verified' : 'Unverified'}
                      color={user.email_verified ? 'success' : 'warning'}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Authentication
                    </Typography>
                    <Chip
                      icon={<Security />}
                      label="Auth0"
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Last Login
                    </Typography>
                    <Typography variant="body2">
                      {new Date().toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<Home />}
            sx={{ textTransform: 'none' }}
          >
            Home
          </Button>
          <Button
            component={Link}
            href="/profile"
            variant="outlined"
            startIcon={<Person />}
            sx={{ textTransform: 'none' }}
          >
            Profile
          </Button>
        </Stack>
      </Container>
    </>
  );
}
