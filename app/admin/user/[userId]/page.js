'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../../../components/Header';
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
  Avatar,
  Chip,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  CheckCircle,
  Cancel,
  PictureAsPdf,
  Assignment,
  Medication,
  Scale,
  Restaurant,
  TrendingUp,
  Email,
  Phone,
  CalendarToday,
  LocationOn,
  AdminPanelSettings,
  Print,
  Download,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`user-tabpanel-${index}`}
      aria-labelledby={`user-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function UserDetailPage() {
  const { user: currentUser, isLoading, error } = useUser();
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (params.userId) {
      fetchUserData();
    }
  }, [params.userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Simulate API call with dummy data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this would come from API
      const mockUserData = {
        user_id: params.userId,
        email: 'john.doe@example.com',
        name: 'John Doe',
        nickname: 'johndoe',
        picture: 'https://via.placeholder.com/80x80/1976d2/ffffff?text=JD',
        email_verified: true,
        blocked: false,
        created_at: '2024-01-15T10:30:00.000Z',
        last_login: '2024-01-20T14:22:00.000Z',
        user_metadata: {
          role: 'user',
          phone_number: '+1-555-0123',
          address: '123 Main St, Kingston, Jamaica',
          parish: 'Kingston',
          birthdate: '1985-06-15',
          gender: 'male',
          // Profile completion
          profile_completed: true,
          medical_profile_completed: true,
          emergency_contact_completed: true,
          // Medical data
          weight_history: [
            { date: '2024-01-01', weight: 85, waistCircumference: 95 },
            { date: '2024-01-08', weight: 83, waistCircumference: 93 },
            { date: '2024-01-15', weight: 81, waistCircumference: 91 },
            { date: '2024-01-22', weight: 79, waistCircumference: 89 },
          ],
          height: 175,
          current_medications: ['Metformin', 'Multivitamin'],
          medication_history: [
            { date: '2024-01-20', time: '08:00', medication: 'Metformin', dosage: '500mg' },
            { date: '2024-01-20', time: '20:00', medication: 'Metformin', dosage: '500mg' },
            { date: '2024-01-21', time: '08:00', medication: 'Metformin', dosage: '500mg' },
          ],
          meal_history: [
            { date: '2024-01-20', meal: 'Breakfast', calories: 350, description: 'Oatmeal with berries' },
            { date: '2024-01-20', meal: 'Lunch', calories: 450, description: 'Grilled chicken salad' },
            { date: '2024-01-20', meal: 'Dinner', calories: 550, description: 'Baked fish with vegetables' },
          ],
          side_effects: ['Nausea', 'Fatigue'],
          appointment_data: {
            scheduled: true,
            date: '2024-01-25',
            time: '14:00',
            type: 'Telemedicine Consultation',
            status: 'Confirmed'
          }
        }
      };
      
      setUserData(mockUserData);
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const generatePDF = () => {
    // Mock PDF generation
    alert('PDF generation would be implemented here. This would create a comprehensive user report.');
  };

  const generateLabRequisition = () => {
    // Navigate to lab requisition page
    router.push('/lab-requisition');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading || !mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading user details...
          </Typography>
        </Container>
      </>
    );
  }

  if (error || !userData) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading user details
          </Alert>
        </Container>
      </>
    );
  }

  // Prepare chart data
  const weightChartData = userData.user_metadata.weight_history?.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    waistCircumference: entry.waistCircumference,
    bmi: calculateBMI(entry.weight, userData.user_metadata.height)
  })) || [];

  const latestWeight = userData.user_metadata.weight_history?.[userData.user_metadata.weight_history.length - 1];
  const currentBMI = latestWeight ? calculateBMI(latestWeight.weight, userData.user_metadata.height) : null;

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => router.back()}
                sx={{ mr: 2 }}
              >
                <ArrowBack />
              </IconButton>
              <Avatar
                src={userData.picture}
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mr: 3 
                }}
              >
                <Person />
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom color="primary">
                  {userData.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData.email} • User ID: {userData.user_id.slice(0, 8)}...
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<PictureAsPdf />}
                onClick={generatePDF}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
              <Button
                variant="contained"
                startIcon={<Assignment />}
                onClick={generateLabRequisition}
                sx={{ textTransform: 'none' }}
              >
                Lab Requisition
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Profile Completion Status */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile Completion Status
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {userData.user_metadata.profile_completed ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Personal Information: {userData.user_metadata.profile_completed ? 'Complete' : 'Incomplete'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {userData.user_metadata.medical_profile_completed ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Medical Profile: {userData.user_metadata.medical_profile_completed ? 'Complete' : 'Incomplete'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {userData.user_metadata.emergency_contact_completed ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Emergency Contact: {userData.user_metadata.emergency_contact_completed ? 'Complete' : 'Incomplete'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="user details tabs">
              <Tab icon={<Person />} label="Profile Summary" />
              <Tab icon={<Medication />} label="Medications" />
              <Tab icon={<Scale />} label="Weight & BMI" />
              <Tab icon={<Restaurant />} label="Meals" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{userData.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{userData.user_metadata.phone_number}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{userData.user_metadata.address}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Born: {formatDate(userData.user_metadata.birthdate)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Appointment Information
                    </Typography>
                    {userData.user_metadata.appointment_data?.scheduled ? (
                      <Stack spacing={2}>
                        <Typography variant="body2">
                          <strong>Date:</strong> {formatDate(userData.user_metadata.appointment_data.date)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Time:</strong> {userData.user_metadata.appointment_data.time}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Type:</strong> {userData.user_metadata.appointment_data.type}
                        </Typography>
                        <Chip
                          label={userData.user_metadata.appointment_data.status}
                          color="success"
                          size="small"
                        />
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No appointment scheduled
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Current Medications
                    </Typography>
                    {userData.user_metadata.current_medications?.length > 0 ? (
                      <Stack spacing={1}>
                        {userData.user_metadata.current_medications.map((medication, index) => (
                          <Chip
                            key={index}
                            label={medication}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No current medications
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Medication Logs
                    </Typography>
                    {userData.user_metadata.medication_history?.length > 0 ? (
                      <Stack spacing={1}>
                        {userData.user_metadata.medication_history.slice(0, 5).map((entry, index) => (
                          <Box key={index} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {entry.medication} - {entry.dosage}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(entry.date)} at {entry.time}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No medication logs
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Scale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Current Weight
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {latestWeight ? `${latestWeight.weight} kg` : 'No data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      Current BMI
                    </Typography>
                    <Typography variant="h4" color="secondary">
                      {currentBMI || 'No data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      Waist Circumference
                    </Typography>
                    <Typography variant="h4" color="success">
                      {latestWeight ? `${latestWeight.waistCircumference} cm` : 'No data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weight & BMI Progress
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <RechartsTooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#1976d2" strokeWidth={2} name="Weight (kg)" />
                        <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#dc004e" strokeWidth={2} name="BMI" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Meal Logs
                    </Typography>
                    {userData.user_metadata.meal_history?.length > 0 ? (
                      <Stack spacing={2}>
                        {userData.user_metadata.meal_history.map((meal, index) => (
                          <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {meal.meal}
                              </Typography>
                              <Chip label={`${meal.calories} cal`} color="primary" size="small" />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {meal.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(meal.date)}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No meal logs
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Card>
      </Container>
    </>
  );
}

