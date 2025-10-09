'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { enableUserAccount } from '../../../../store/slices/adminSlice';
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
  const dispatch = useDispatch();
  const [mounted, setMounted] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [enablingAccount, setEnablingAccount] = useState(false);

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
      console.log('🔍 Fetching user data for ID:', params.userId);
      
      // Fetch real user data from API
      const response = await fetch(`/api/admin/users/${params.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ User data fetched successfully:', data.user);
      
      setUserData(data.user);
    } catch (err) {
      console.error('❌ Error fetching user data:', err);
      console.error('❌ Error details:', err.message);
      // Set error state or show error message
      setUserData(null);
      setFetchError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleAccount = async () => {
    setEnablingAccount(true);
    const currentStatus = userMetadata?.consultationOccurred;
    const newStatus = !currentStatus;
    
    try {
      console.log(`${newStatus ? '🔓' : '🔒'} ${newStatus ? 'Enabling' : 'Disabling'} account for user:`, params.userId);
      
      // Dispatch saga to update consultationOccurred
      dispatch(enableUserAccount({
        userId: params.userId,
        consultationOccurred: newStatus
      }));
      
      // Refresh user data after a short delay to allow the saga to complete
      setTimeout(() => {
        fetchUserData();
        setEnablingAccount(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error toggling account:', err);
      setEnablingAccount(false);
    }
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

  if (error || fetchError || (!loading && !userData)) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading user details: {error?.message || fetchError?.message || 'User not found'}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push('/admin')}
            sx={{ mt: 2 }}
          >
            Back to Admin Panel
          </Button>
        </Container>
      </>
    );
  }

  // Prepare chart data - handle cases where user_metadata might not exist
  const userMetadata = userData?.user_metadata || {};
  const weightChartData = userMetadata.weight_history?.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    waistCircumference: entry.waistCircumference,
    bmi: calculateBMI(entry.weight, userMetadata.height)
  })) || [];

  const latestWeight = userMetadata.weight_history?.[userMetadata.weight_history.length - 1];
  const currentBMI = latestWeight ? calculateBMI(latestWeight.weight, userMetadata.height) : null;

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
                src={userData?.picture}
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
                  {userData?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userData?.email} • User ID: {userData?.user_id?.slice(0, 8)}...
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleToggleAccount}
                disabled={enablingAccount}
                sx={{
                  textTransform: 'none',
                  backgroundColor: userMetadata?.consultationOccurred ? '#f44336' : '#877449',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: userMetadata?.consultationOccurred ? '#d32f2f' : '#B8941F',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#555',
                    color: '#888',
                  }
                }}
              >
                {enablingAccount ? 
                  (userMetadata?.consultationOccurred ? 'Disabling...' : 'Enabling...') :
                  (userMetadata?.consultationOccurred ? 'Disable Account' : 'Enable Account')
                }
              </Button>
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
                  {userMetadata.consultationOccurred ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Consultation: {userMetadata.consultationOccurred ? 'Completed' : 'Not Completed'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {userMetadata.profile_completed ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Personal Information: {userMetadata.profile_completed ? 'Complete' : 'Incomplete'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {userMetadata.medical_profile_completed ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Medical Profile: {userMetadata.medical_profile_completed ? 'Complete' : 'Incomplete'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {userMetadata.emergency_contact_completed ? (
                    <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <Cancel sx={{ color: 'error.main', mr: 1 }} />
                  )}
                  <Typography variant="body2">
                    Emergency Contact: {userMetadata.emergency_contact_completed ? 'Complete' : 'Incomplete'}
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
                        <Typography variant="body2">{userData?.email}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{userMetadata.phone_number || 'Not provided'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">{userMetadata.address || 'Not provided'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          Born: {userMetadata.birthdate ? formatDate(userMetadata.birthdate) : 'Not provided'}
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
                    {userMetadata.appointment_data?.scheduled ? (
                      <Stack spacing={2}>
                        <Typography variant="body2">
                          <strong>Date:</strong> {formatDate(userMetadata.appointment_data.date)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Time:</strong> {userMetadata.appointment_data.time}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Type:</strong> {userMetadata.appointment_data.type}
                        </Typography>
                        <Chip
                          label={userMetadata.appointment_data.status}
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
                    {(() => {
                      // Handle both array and string formats
                      const medications = Array.isArray(userMetadata.current_medications)
                        ? userMetadata.current_medications
                        : typeof userMetadata.current_medications === 'string' && userMetadata.current_medications
                        ? [userMetadata.current_medications]
                        : [];
                      
                      return medications.length > 0 ? (
                        <Stack spacing={1}>
                          {medications.map((medication, index) => (
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
                      );
                    })()}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Medication Logs
                    </Typography>
                    {userMetadata.medication_history?.length > 0 ? (
                      <Stack spacing={1}>
                        {userMetadata.medication_history.slice(0, 5).map((entry, index) => (
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
                    {userMetadata.meal_history?.length > 0 ? (
                      <Stack spacing={2}>
                        {userMetadata.meal_history.map((meal, index) => (
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

