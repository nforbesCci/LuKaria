'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { enableUserAccount, fetchAdminMealsAction, fetchAdminConsentFormsAction, updateAdminConsentFormAction, fetchAdminProfileAction, fetchAdminMedicationsAction, fetchAdminMeasurementsAction, fetchAdminSideEffectsAction, updateAdminSideEffectAction, fetchAdminQuestionsAction, deleteAdminQuestionAction, fetchAdminPreAppointmentTasks } from '../../../../store/slices/adminSlice';
import AdminConsentForms from '../../../../components/AdminConsentForms';
import ConsentFormViewer from '../../../../components/ConsentFormViewer';
import { adminRescheduleAppointment } from '../../../../store/slices/appointmentSlice';
import { useAdminAccess } from '../../../../hooks/useAccessControl';
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
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
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
  Event,
  Edit,
  Save,
  Close,
  NavigateNext,
  NavigateBefore,
  Check,
  LocalHospital,
  HealthAndSafety,
  Quiz,
  Home as HomeIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

function TabPanel({ children, value, index, id, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={id || `user-tabpanel-${index}`}
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
  
  // Get appointment booking state from Redux
  const isBooking = useSelector((state) => state.appointment.isBooking);
  const bookingError = useSelector((state) => state.appointment.bookingError);
  const adminRescheduleSuccess = useSelector((state) => state.appointment.adminRescheduleSuccess);
  
  // Get admin meals state from Redux
  const meals = useSelector((state) => state.admin.adminMeals);
  const mealsLoading = useSelector((state) => state.admin.adminMealsLoading);
  const mealsError = useSelector((state) => state.admin.adminMealsError);
  
  // Get admin consent forms state from Redux
  const consentForms = useSelector((state) => state.admin.adminConsentForms);
  const consentFormsLoading = useSelector((state) => state.admin.adminConsentFormsLoading);
  const consentFormsError = useSelector((state) => state.admin.adminConsentFormsError);
  
  // Get admin profile state from Redux
  const adminProfile = useSelector((state) => state.admin.adminProfile);
  const adminProfileLoading = useSelector((state) => state.admin.adminProfileLoading);
  const adminProfileError = useSelector((state) => state.admin.adminProfileError);
  const medicalProfileStatus = useSelector((state) => state.admin.medicalProfileStatus);
  
  // Get admin medications state from Redux
  const adminMedications = useSelector((state) => state.admin.adminMedications);
  const adminMedicationsLoading = useSelector((state) => state.admin.adminMedicationsLoading);
  const adminMedicationsError = useSelector((state) => state.admin.adminMedicationsError);
  
  // Get admin measurements state from Redux
  const adminMeasurements = useSelector((state) => state.admin.adminMeasurements);
  const adminMeasurementsLoading = useSelector((state) => state.admin.adminMeasurementsLoading);
  const adminMeasurementsError = useSelector((state) => state.admin.adminMeasurementsError);
  
  // Get admin side effects state from Redux
  const adminSideEffects = useSelector((state) => state.admin.adminSideEffects);
  const adminSideEffectsLoading = useSelector((state) => state.admin.adminSideEffectsLoading);
  const adminSideEffectsError = useSelector((state) => state.admin.adminSideEffectsError);
  
  // Get admin questions state from Redux
  const adminQuestions = useSelector((state) => state.admin.adminQuestions);
  const adminQuestionsLoading = useSelector((state) => state.admin.adminQuestionsLoading);
  const adminQuestionsError = useSelector((state) => state.admin.adminQuestionsError);
  const adminPreAppointmentTasks = useSelector((state) => state.admin.adminPreAppointmentTasks);
  const adminPreAppointmentTasksLoading = useSelector((state) => state.admin.adminPreAppointmentTasksLoading);

  // Debug Redux state
  console.log('🔍 Redux meals state:', {
    meals,
    mealsLoading,
    mealsError,
    mealsKeys: meals ? Object.keys(meals) : 'no meals',
    mealsType: typeof meals,
    mealsLength: meals ? Object.keys(meals).length : 0
  });

  // Debug when meals state changes
  useEffect(() => {
    console.log('🔄 Meals state changed:', {
      meals,
      mealsLoading,
      mealsError,
      hasData: meals && Object.keys(meals).length > 0
    });
  }, [meals, mealsLoading, mealsError]);

  // Debug when admin profile state changes
  useEffect(() => {
    console.log('🔄 Admin profile state changed:', {
      adminProfile,
      adminProfileLoading,
      adminProfileError,
      medicalProfileStatus
    });
  }, [adminProfile, adminProfileLoading, adminProfileError, medicalProfileStatus]);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [enablingAccount, setEnablingAccount] = useState(false);
  const [dbConsultationOccurred, setDbConsultationOccurred] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    type: 'consultation',
    date: '',
    time: '',
    length: 30,
  });
  const [appointmentSuccess, setAppointmentSuccess] = useState(false);
  const [dbProfile, setDbProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeWizardStep, setActiveWizardStep] = useState(0);
  const [editableProfile, setEditableProfile] = useState({
    // Personal Information
    phone_number: '',
    address: '',
    birthdate: '',
    parish: '',
    gender: '',
    
    // Emergency Contact
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    
    // Medical Information
    medicalConditions: [],
    otherMedicalCondition: '',
    hasAllergies: false,
    allergicMedications: '',
    currentMedications: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedSideEffect, setSelectedSideEffect] = useState(null);
  const [viewingConsentForm, setViewingConsentForm] = useState(null);

  // Access control - only Admin and Doctor can access
  useAdminAccess();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (params.userId) {
      fetchUserData();
      fetchDbProfile();
      // Fetch admin profile to check medical profile task completion
      dispatch(fetchAdminProfileAction({ userId: params.userId }));
    }
  }, [params.userId, dispatch]);

  // Fetch pre-appointment tasks when consultation is completed
  useEffect(() => {
    if (params.userId && dbConsultationOccurred) {
      console.log('🔄 Consultation completed, fetching pre-appointment tasks for user:', params.userId);
      dispatch(fetchAdminPreAppointmentTasks({ userId: params.userId }));
    }
  }, [params.userId, dbConsultationOccurred, dispatch]);

  // Fetch meals when Meal Tracker tab is selected or week changes
  useEffect(() => {
    if (tabValue === 5 && params.userId) { // Meal Tracker tab index
      // Calculate date range for the current week
      const dateRange = getWeekDateRange(currentWeek);
      const startDate = dateRange.startDate.toISOString().split('T')[0];
      const endDate = dateRange.endDate.toISOString().split('T')[0];
      
      dispatch(fetchAdminMealsAction({ 
        userId: params.userId, 
        startDate, 
        endDate 
      }));
    }
  }, [tabValue, currentWeek, dispatch, params.userId]);

  // Fetch medications when Medication Tracker tab is selected
  useEffect(() => {
    if (tabValue === 4 && params.userId) { // Medication Tracker tab index
      dispatch(fetchAdminMedicationsAction({ 
        userId: params.userId, 
        daysBack: 28 // Last 4 weeks
      }));
    }
  }, [tabValue, params.userId, dispatch]);

  // Fetch measurements when Weight Logging tab is selected
  useEffect(() => {
    if (tabValue === 3 && params.userId) { // Weight Logging tab index
      dispatch(fetchAdminMeasurementsAction({ 
        userId: params.userId, 
        daysBack: 28 // Last 4 weeks
      }));
    }
  }, [tabValue, params.userId, dispatch]);

  // Fetch side effects when Side Effects tab is selected
  useEffect(() => {
    if (tabValue === 2 && params.userId) { // Side Effects tab index
      dispatch(fetchAdminSideEffectsAction({ 
        userId: params.userId, 
        limit: 4 // Last 4 side effects
      }));
    }
  }, [tabValue, params.userId, dispatch]);

  // Fetch questions when Questions tab is selected
  useEffect(() => {
    if (tabValue === 6 && params.userId) { // Questions tab index
      dispatch(fetchAdminQuestionsAction({ 
        userId: params.userId, 
        limit: 10 // Last 10 questions
      }));
    }
  }, [tabValue, params.userId, dispatch]);

  // Fetch consent forms when Consent Forms tab is selected
  useEffect(() => {
    if (tabValue === 1 && params.userId) { // Consent Forms tab index
      dispatch(fetchAdminConsentFormsAction({ userId: params.userId }));
    }
  }, [tabValue, dispatch, params.userId]);

  // Watch for successful admin reschedule
  useEffect(() => {
    if (adminRescheduleSuccess) {
      console.log('✅ Admin reschedule success detected');
      
      // Show success message
      setAppointmentSuccess(true);
      setTimeout(() => setAppointmentSuccess(false), 5000);
      
      // Refresh user data
      fetchUserData();
      fetchDbProfile();
      
      // Close reschedule view
      setShowReschedule(false);
      
      // Reset form
      setAppointmentData({
        type: 'consultation',
        date: '',
        time: '',
        length: 30,
      });
    }
  }, [adminRescheduleSuccess]);

  // Watch for booking errors
  useEffect(() => {
    if (bookingError) {
      console.error('❌ Booking error detected:', bookingError);
      alert(`Failed to save appointment: ${bookingError}`);
    }
  }, [bookingError]);

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

  const fetchDbProfile = async () => {
    try {
      console.log('🔍 Fetching DB profile for user:', params.userId);
      
      const response = await fetch(`/api/admin/users/${params.userId}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('⚠️ Could not fetch DB profile');
        return;
      }

      const data = await response.json();
      console.log('✅ DB Profile fetched:', data);
      
      // Store the entire profile
      if (data.profile) {
        setDbProfile(data.profile);
        console.log('📋 DB Profile stored:', data.profile);
      }
      
      if (data.profile?.user_metadata?.consultationOccurred !== undefined) {
        setDbConsultationOccurred(data.profile.user_metadata.consultationOccurred);
        console.log('📋 consultationOccurred from DB:', data.profile.user_metadata.consultationOccurred);
      }
    } catch (err) {
      console.warn('⚠️ Error fetching DB profile:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleToggleAccount = async () => {
    setEnablingAccount(true);
    // Use DB value as source of truth
    const currentStatus = dbConsultationOccurred;
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
        fetchDbProfile();
        setEnablingAccount(false);
      }, 2000);
      
    } catch (err) {
      console.error('❌ Error toggling account:', err);
      setEnablingAccount(false);
    }
  };

  const handleAppointmentChange = (field, value) => {
    setAppointmentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAppointment = () => {
    console.log('📅 Initiating appointment save for user:', params.userId);
    console.log('📋 Appointment data:', appointmentData);
    
    // Dispatch saga to save appointment
    const decodedUserId = decodeURIComponent(params.userId);
    dispatch(adminRescheduleAppointment(decodedUserId, {
      type: appointmentData.type,
      date: appointmentData.date,
      time: appointmentData.time,
      length: appointmentData.length,
      scheduled: true,
      status: 'scheduled',
    }));
    
    // The useEffect hook will handle the success case
  };

  const handleEditProfile = () => {
    console.log('✏️ Editing profile for user:', params.userId);
    console.log('Current Admin Profile:', adminProfile);
    
    // Initialize editable profile with data from adminProfile in store
    setEditableProfile({
      // Personal Information
      phone_number: adminProfile?.preferredPhone || '',
      address: adminProfile?.homeAddress || '',
      birthdate: adminProfile?.dateOfBirth || '',
      parish: adminProfile?.parish || '',
      gender: adminProfile?.sex || '',
      
      // Emergency Contact
      nextOfKinName: adminProfile?.emergencyContactName || '',
      nextOfKinPhone: adminProfile?.emergencyContactPhone || '',
      nextOfKinRelationship: adminProfile?.emergencyContactRelationship || '',
      
      // Medical Information
      medicalConditions: adminProfile?.medicalConditions || [],
      otherMedicalCondition: adminProfile?.otherMedicalCondition || '',
      hasAllergies: adminProfile?.hasAllergies || false,
      allergicMedications: adminProfile?.allergicMedications || '',
      currentMedications: adminProfile?.currentMedications || '',
    });
    
    setActiveWizardStep(0);
    setIsEditingProfile(true);
  };

  // Wizard steps configuration
  const profileWizardSteps = [
    {
      label: 'Personal Info',
      icon: <Person />,
      description: 'Contact and personal details'
    },
    {
      label: 'Emergency Contact',
      icon: <Phone />,
      description: 'Next of kin information'
    },
    {
      label: 'Medical History',
      icon: <LocalHospital />,
      description: 'Medical conditions and allergies'
    }
  ];

  const medicalConditionsList = [
    'Hypertension',
    'Diabetes',
    'Obesity',
    'High Cholesterol',
    'Sleep Apnea',
    'Kidney Disease',
    'Thyroid Disease',
    'None of the above',
    'Other'
  ];

  const jamaicaParishes = [
    'Kingston',
    'St. Andrew',
    'St. Thomas',
    'Portland',
    'St. Mary',
    'St. Ann',
    'Trelawny',
    'St. James',
    'Hanover',
    'Westmoreland',
    'St. Elizabeth',
    'Manchester',
    'Clarendon',
    'St. Catherine'
  ];

  const handleProfileFieldChange = (field, value) => {
    setEditableProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicalConditionChange = (condition, checked) => {
    setEditableProfile(prev => ({
      ...prev,
      medicalConditions: checked 
        ? [...prev.medicalConditions, condition]
        : prev.medicalConditions.filter(c => c !== condition)
    }));
  };

  const handleWizardNext = () => {
    setActiveWizardStep((prevStep) => prevStep + 1);
  };

  const handleWizardBack = () => {
    setActiveWizardStep((prevStep) => prevStep - 1);
  };

  const handleWizardStepClick = (step) => {
    setActiveWizardStep(step);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      console.log('💾 Saving profile for user:', params.userId);
      console.log('📋 Profile data:', editableProfile);
      
      // Prepare the full profile data
      const profileData = {
        user_metadata: {
          phone_number: editableProfile.phone_number,
          address: editableProfile.address,
          birthdate: editableProfile.birthdate,
          gender: editableProfile.gender,
          emergency_contact_name: editableProfile.nextOfKinName,
          emergency_contact_phone: editableProfile.nextOfKinPhone,
          emergency_contact_relationship: editableProfile.nextOfKinRelationship,
          medical_conditions: editableProfile.medicalConditions,
          other_medical_condition: editableProfile.otherMedicalCondition,
          has_allergies: editableProfile.hasAllergies,
          allergic_medications: editableProfile.allergicMedications,
          current_medications: editableProfile.currentMedications,
        },
        parish: editableProfile.parish,
        gender: editableProfile.gender,
        nextOfKinName: editableProfile.nextOfKinName,
        nextOfKinPhone: editableProfile.nextOfKinPhone,
        nextOfKinRelationship: editableProfile.nextOfKinRelationship,
        medicalConditions: editableProfile.medicalConditions,
        otherMedicalCondition: editableProfile.otherMedicalCondition,
        hasAllergies: editableProfile.hasAllergies,
        allergicMedications: editableProfile.allergicMedications,
        currentMedications: editableProfile.currentMedications,
      };
      
      const response = await fetch(`/api/admin/users/${params.userId}/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const data = await response.json();
      console.log('✅ Profile saved:', data);
      
      // Refresh user data
      await fetchUserData();
      await fetchDbProfile();
      
      // Close edit wizard
      setIsEditingProfile(false);
      setActiveWizardStep(0);
      
      // Show success message
      alert('Profile updated successfully!');
      
    } catch (err) {
      console.error('❌ Error saving profile:', err);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setActiveWizardStep(0);
    setEditableProfile({
      phone_number: '',
      address: '',
      birthdate: '',
      parish: '',
      gender: '',
      nextOfKinName: '',
      nextOfKinPhone: '',
      nextOfKinRelationship: '',
      medicalConditions: [],
      otherMedicalCondition: '',
      hasAllergies: false,
      allergicMedications: '',
      currentMedications: '',
    });
  };

  // Render wizard step content
  const renderWizardStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Personal Information
        return (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editableProfile.phone_number || ''}
                  onChange={(e) => handleProfileFieldChange('phone_number', e.target.value)}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Birth Date"
                  type="date"
                  value={editableProfile.birthdate || ''}
                  onChange={(e) => handleProfileFieldChange('birthdate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: <CalendarToday sx={{ mr: 1, color: '#877449' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={editableProfile.address || ''}
                  onChange={(e) => handleProfileFieldChange('address', e.target.value)}
                  InputProps={{
                    startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={editableProfile.gender || ''}
                    label="Gender"
                    onChange={(e) => handleProfileFieldChange('gender', e.target.value)}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Parish</InputLabel>
                  <Select
                    value={editableProfile.parish || ''}
                    label="Parish"
                    onChange={(e) => handleProfileFieldChange('parish', e.target.value)}
                  >
                    <MenuItem value="">Select Parish</MenuItem>
                    {jamaicaParishes.map((parish) => (
                      <MenuItem key={parish} value={parish}>
                        {parish}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Emergency Contact
        return (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Next of Kin Name"
                  value={editableProfile.nextOfKinName || ''}
                  onChange={(e) => handleProfileFieldChange('nextOfKinName', e.target.value)}
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  type="tel"
                  value={editableProfile.nextOfKinPhone || ''}
                  onChange={(e) => handleProfileFieldChange('nextOfKinPhone', e.target.value)}
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={editableProfile.nextOfKinRelationship || ''}
                  onChange={(e) => handleProfileFieldChange('nextOfKinRelationship', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2: // Medical History
        return (
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Medical Conditions
                </Typography>
                <FormGroup>
                  <Grid container spacing={1}>
                    {medicalConditionsList.map((condition) => (
                      <Grid item xs={12} sm={6} key={condition}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={editableProfile.medicalConditions?.includes(condition)}
                              onChange={(e) => handleMedicalConditionChange(condition, e.target.checked)}
                            />
                          }
                          label={condition}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormGroup>
                
                {editableProfile.medicalConditions?.includes('Other') && (
                  <TextField
                    fullWidth
                    label="Please specify other medical conditions"
                    multiline
                    rows={2}
                    value={editableProfile.otherMedicalCondition || ''}
                    onChange={(e) => handleProfileFieldChange('otherMedicalCondition', e.target.value)}
                    sx={{ mt: 2 }}
                  />
                )}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Current Medications
                </Typography>
                <TextField
                  fullWidth
                  label="List all current medications"
                  multiline
                  rows={3}
                  value={editableProfile.currentMedications || ''}
                  onChange={(e) => handleProfileFieldChange('currentMedications', e.target.value)}
                  placeholder="Medication name, dosage, frequency..."
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset" sx={{ mt: 2 }}>
                  <FormLabel component="legend">Are you allergic to any medications?</FormLabel>
                  <RadioGroup
                    row
                    value={editableProfile.hasAllergies ? 'yes' : 'no'}
                    onChange={(e) => handleProfileFieldChange('hasAllergies', e.target.value === 'yes')}
                  >
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>

              {editableProfile.hasAllergies && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Medication Allergies"
                    multiline
                    rows={2}
                    value={editableProfile.allergicMedications || ''}
                    onChange={(e) => handleProfileFieldChange('allergicMedications', e.target.value)}
                    placeholder="List all medication allergies..."
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const generateTabPDF = async (tabName, elementId) => {
    try {
      // Show loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '50%';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translate(-50%, -50%)';
      loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      loadingMessage.style.color = 'white';
      loadingMessage.style.padding = '20px';
      loadingMessage.style.borderRadius = '8px';
      loadingMessage.style.zIndex = '9999';
      loadingMessage.style.fontFamily = 'Arial, sans-serif';
      loadingMessage.innerHTML = `Generating ${tabName} PDF...<br><small>This may take a few moments</small>`;
      document.body.appendChild(loadingMessage);

      // Import jsPDF and html2canvas dynamically
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(tabName, 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`User: ${userData?.name || userData?.email || 'Unknown User'}`, 105, 30, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 35, { align: 'center' });

      // Find the tab content element
      const tabPanel = document.getElementById(elementId);
      
      if (tabPanel) {
        // Create a temporary container for the tab content
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.padding = '20px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.style.fontSize = '12px';
        tempContainer.style.lineHeight = '1.4';
        tempContainer.style.color = '#000000';
        
        // Clone the tab content
        const clonedContent = tabPanel.cloneNode(true);
        
        // Remove any loading spinners or error messages from cloned content
        const loadingElements = clonedContent.querySelectorAll('[class*="CircularProgress"], [class*="loading"]');
        loadingElements.forEach(el => el.remove());
        
        tempContainer.appendChild(clonedContent);
        document.body.appendChild(tempContainer);

        try {
          // Capture the content as canvas
          const canvas = await html2canvas(tempContainer, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: tempContainer.scrollWidth,
            height: tempContainer.scrollHeight,
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight,
          });

          // Calculate dimensions for A4
          const imgWidth = 170; // A4 width minus margins
          const pageHeight = 240; // A4 height minus margins for header
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // If content is too tall, scale it down
          if (imgHeight > pageHeight) {
            const scaleFactor = pageHeight / imgHeight;
            const scaledWidth = imgWidth * scaleFactor;
            const scaledHeight = pageHeight;
            const xOffset = (imgWidth - scaledWidth) / 2;
            
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20 + xOffset, 45, scaledWidth, scaledHeight);
          } else {
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, 45, imgWidth, imgHeight);
          }

        } finally {
          // Clean up temporary container
          document.body.removeChild(tempContainer);
        }
      } else {
        console.warn(`Tab panel not found for ${tabName}`);
        // Add a message to PDF if content not found
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Content not available', 105, 100, { align: 'center' });
      }

      // Remove loading message
      document.body.removeChild(loadingMessage);

      // Generate filename with user info and date
      const userName = userData?.name || userData?.email || 'User';
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${tabName.replace(/[^a-zA-Z0-9]/g, '-')}-${userName.replace(/[^a-zA-Z0-9]/g, '-')}-${dateStr}.pdf`;

      // Save the PDF
      pdf.save(fileName);

      // Show success message
      alert(`${tabName} PDF generated successfully: ${fileName}`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Remove loading message if it exists
      const loadingMessage = document.querySelector('div[style*="position: fixed"]');
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }
      alert(`Error generating ${tabName} PDF. Please try again.`);
    }
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

  // Handle consent form updates
  const handleConsentFormUpdate = (formType, updates) => {

    dispatch(updateAdminConsentFormAction({ 
      userId: params.userId, 
      formType, 
      updates 
    }));
  };

  // Handle enabling/disabling consent forms
  const handleToggleConsentForm = (formType, enabled) => {
    handleConsentFormUpdate(formType, { enabled });
  };

  // Handle unlocking consent forms (both locked and completed)
  const handleUnlockConsentForm = (formType) => {
    const form = consentForms[formType];
    if (form?.complete) {
      // Unlock completed form
      handleConsentFormUpdate(formType, { complete: false });
    } else if (form?.locked) {
      // Unlock locked form
      handleConsentFormUpdate(formType, { locked: false });
    }
  };

  // Handle viewing consent forms
  const handleViewConsentForm = (formType, formData) => {
    console.log('Viewing consent form:', formType, formData);
    setViewingConsentForm({ formType, formData });
  };

  // Handle closing the consent form viewer
  const handleCloseConsentFormViewer = () => {
    setViewingConsentForm(null);
  };

  // Handle side effect selection
  const handleSideEffectClick = (sideEffect) => {
    setSelectedSideEffect(selectedSideEffect?._id === sideEffect._id ? null : sideEffect);
  };

  // Handle side effect review
  const handleReviewSideEffect = (sideEffectId) => {
    dispatch(updateAdminSideEffectAction({
      userId: params.userId,
      sideEffectId,
      action: 'review',
      updates: { reviewed: true }
    }));
  };

  // Handle side effect open (set complete to false)
  const handleOpenSideEffect = (sideEffectId) => {
    dispatch(updateAdminSideEffectAction({
      userId: params.userId,
      sideEffectId,
      action: 'open',
      updates: { complete: false }
    }));
  };

  // Handle question deletion
  const handleDeleteQuestion = (questionId) => {
    console.log('🚀 DISPATCHING DELETE ADMIN QUESTION ACTION!', { 
      userId: params.userId, 
      questionId 
    });
    
    // Dispatch the delete action to the saga
    const action = deleteAdminQuestionAction({ 
      userId: params.userId, 
      questionId 
    });
    console.log('🚀 Action object:', action);
    dispatch(action);
    console.log('🚀 Action dispatched successfully');
  };

  // Get date range for a specific week
  const getWeekDateRange = (weekNumber) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + (weekNumber - 1) * 7));
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short' 
      });
    };
    
    return {
      start: formatDate(startOfWeek),
      end: formatDate(endOfWeek),
      startDate: startOfWeek,
      endDate: endOfWeek
    };
  };

  // Get meals data for a specific week
  const getWeekMealsData = (weekNumber) => {
    console.log('🔍 getWeekMealsData called with weekNumber:', weekNumber);
    console.log('🔍 Current meals state:', meals);
    console.log('🔍 Meals keys:', Object.keys(meals || {}));
    
    if (!meals || Object.keys(meals).length === 0) {
      console.log('⚠️ No meals data available');
      return {};
    }
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (today.getDay() + (weekNumber - 1) * 7));
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
    
    const weekData = {};
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      console.log(`🔍 Checking date ${dateStr} for ${daysOfWeek[i]}:`, meals[dateStr]);
      
      if (meals[dateStr]) {
        weekData[daysOfWeek[i]] = meals[dateStr];
        console.log(`✅ Found data for ${dateStr}:`, meals[dateStr]);
      } else {
        // Default structure for days with no data
        weekData[daysOfWeek[i]] = {
          breakfast: { name: 'No data', calories: 0, quantity: 1 },
          lunch: { name: 'No data', calories: 0, quantity: 1 },
          dinner: { name: 'No data', calories: 0, quantity: 1 },
          snacks: { name: 'No data', calories: 0, quantity: 1 }
        };
        console.log(`❌ No data for ${dateStr}, using defaults`);
      }
    }
    
    console.log('🔍 Final weekData:', weekData);
    return weekData;
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
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" color="primary">
                  {userData?.name}
                </Typography>
                {!dbConsultationOccurred && (
                  <Chip
                    label="Disabled"
                    color="error"
                    size="small"
                    icon={<Cancel />}
                    sx={{ 
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        fontSize: 18
                      }
                    }}
                  />
                )}
                {dbConsultationOccurred && (
                  <Chip
                    label="Active"
                    color="success"
                    size="small"
                    icon={<CheckCircle />}
                    sx={{ 
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        fontSize: 18
                      }
                    }}
                  />
                )}
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {userData?.email} • User ID: {userData?.user_id?.slice(0, 8)}...
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Success Alert */}
        {appointmentSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Appointment has been successfully scheduled for {userData?.name}!
          </Alert>
        )}

        {/* Action Buttons Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                onClick={handleToggleAccount}
                disabled={enablingAccount}
                sx={{
                  textTransform: 'none',
                  backgroundColor: dbConsultationOccurred ? '#f44336' : '#877449',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: dbConsultationOccurred ? '#d32f2f' : '#B8941F',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#555',
                    color: '#888',
                  }
                }}
              >
                {enablingAccount ? 
                  (dbConsultationOccurred ? 'Disabling...' : 'Enabling...') :
                  (dbConsultationOccurred ? 'Disable Account' : 'Enable Account')
                }
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Event sx={{ color: '#877449' }} />}
                onClick={() => {
                  console.log('📅 Loading appointment details for reschedule');
                  console.log('DB Profile:', dbProfile);
                  
                  // Pre-populate form with existing appointment data from MongoDB profile
                  const existingAppointment = dbProfile;
                  console.log('Existing appointment from DB:', existingAppointment);
                  
                  if (existingAppointment && existingAppointment.isScheduled) {
                    // Format date if needed (convert from various formats)
                    let formattedDate = '';
                    if (existingAppointment.date) {
                      // Try to parse and format the date
                      const dateObj = new Date(existingAppointment.date);
                      if (!isNaN(dateObj.getTime())) {
                        formattedDate = dateObj.toISOString().split('T')[0];
                      } else {
                        formattedDate = existingAppointment.date;
                      }
                    }
                    
                    setAppointmentData({
                      type: existingAppointment.type || 'consultation',
                      date: formattedDate,
                      time: existingAppointment.time || '',
                      length: existingAppointment.length || 30,
                    });
                    console.log('✅ Appointment form pre-populated from DB:', {
                      type: existingAppointment.type || 'consultation',
                      date: formattedDate,
                      time: existingAppointment.time || '',
                      length: existingAppointment.length || 30,
                    });
                  } else {
                    console.log('ℹ️ No existing appointment found in DB, using defaults');
                    // Reset to defaults if no appointment exists
                    setAppointmentData({
                      type: 'consultation',
                      date: '',
                      time: '',
                      length: 30,
                    });
                  }
                  setShowReschedule(true);
                }}
                sx={{ textTransform: 'none' }}
              >
                Reschedule
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
          </CardContent>
        </Card>

        {/* Profile Completion Status */}
        {!showReschedule && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Profile Completion Status
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {dbConsultationOccurred ? (
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                    ) : (
                      <Cancel sx={{ color: 'error.main', mr: 1 }} />
                    )}
                    <Typography variant="body2">
                      Consultation: {dbConsultationOccurred ? 'Completed' : 'Not Completed'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Pre-Appointment Tasks Status */}
              {dbConsultationOccurred && (
                <Box sx={{ mt: 3 }}>
                  {adminPreAppointmentTasksLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2">Loading pre-appointment tasks...</Typography>
                    </Box>
                  ) : adminPreAppointmentTasks && adminPreAppointmentTasks.length > 0 ? (
                    <Grid container spacing={2}>
                      {adminPreAppointmentTasks.map((task, index) => {
                        console.log('🔍 Task data:', task);
                        return (
                          <Grid item xs={12} md={6} key={task._id || index}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {task.completed ? (
                                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                              ) : (
                                <Cancel sx={{ color: 'error.main', mr: 1 }} />
                              )}
                              <Typography variant="body2">
                                {task.taskKey === 'completeMedicalProfile' ? 'Medical Profile' : 
                                 task.taskKey === 'enterWeightHeight' ? 'Weight and Height' : 
                                 task.taskKey === 'completeConsentForms' ? 'Consent Forms Complete' : 
                                 task.taskKey === 'prepareQuestions' ? 'Prepared Questions' : 
                                 task.taskKey}
                              </Typography>
                            </Box>
                            {task.notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 3, display: 'block' }}>
                                {task.notes}
                              </Typography>
                            )}
                          </Grid>
                        );
                      })}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No pre-appointment tasks found
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reschedule View */}
        {showReschedule && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarToday sx={{ fontSize: 30, mr: 2, color: '#877449' }} />
                  <Box>
                    <Typography variant="h5" gutterBottom color="primary">
                      {dbProfile?.isScheduled ? 'Reschedule' : 'Schedule'} Appointment
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dbProfile?.isScheduled 
                        ? `Update appointment for ${userData?.name}` 
                        : `Set a new appointment for ${userData?.name}`}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => setShowReschedule(false)}
                  sx={{ textTransform: 'none' }}
                >
                  Back to Profile
                </Button>
              </Box>

              {/* Show current appointment info if exists */}
              {dbProfile?.isScheduled && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Current Appointment:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Type:</strong> {dbProfile.type} • 
                    <strong> Date:</strong> {formatDate(dbProfile.date)} • 
                    <strong> Time:</strong> {dbProfile.time} • 
                    <strong> Duration:</strong> {dbProfile.length} min
                  </Typography>
                </Alert>
              )}

              {/* Appointment Form */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="appointment-type-label">Appointment Type</InputLabel>
                    <Select
                      labelId="appointment-type-label"
                      id="appointment-type"
                      value={appointmentData.type}
                      label="Appointment Type"
                      onChange={(e) => handleAppointmentChange('type', e.target.value)}
                    >
                      <MenuItem value="consultation">Consultation</MenuItem>
                      <MenuItem value="review">Review</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="appointment-length-label">Appointment Length</InputLabel>
                    <Select
                      labelId="appointment-length-label"
                      id="appointment-length"
                      value={appointmentData.length}
                      label="Appointment Length"
                      onChange={(e) => handleAppointmentChange('length', e.target.value)}
                    >
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={45}>45 minutes</MenuItem>
                      <MenuItem value={60}>60 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => handleAppointmentChange('date', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0]
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => handleAppointmentChange('time', e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => setShowReschedule(false)}
                      disabled={isBooking}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSaveAppointment}
                      disabled={isBooking || !appointmentData.date || !appointmentData.time}
                      sx={{ 
                        textTransform: 'none',
                        backgroundColor: '#877449',
                        '&:hover': {
                          backgroundColor: '#B8941F',
                        }
                      }}
                    >
                      {isBooking ? 'Saving...' : 'Save Appointment'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        {!showReschedule && (
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="user details tabs">
              <Tab icon={<Person />} label="Profile Summary" />
              <Tab icon={<Assignment />} label="Consent Forms" />
              <Tab icon={<HealthAndSafety />} label="Side Effects" />
              <Tab icon={<Scale />} label="Weight Logging" />
              <Tab icon={<Medication />} label="Medication Tracker" />
              <Tab icon={<Restaurant />} label="Meal Tracker" />
              <Tab icon={<Quiz />} label="Questions" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0} id="profile-summary-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Profile Summary</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() => generateTabPDF('Profile Summary', 'profile-summary-content')}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
            </Box>
            {adminProfileLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading profile data...
                </Typography>
              </Box>
            ) : adminProfileError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading profile: {adminProfileError}
              </Alert>
            ) : !isEditingProfile ? (
              // View Mode
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={handleEditProfile}
                      sx={{ 
                        textTransform: 'none',
                        backgroundColor: '#877449',
                        '&:hover': {
                          backgroundColor: '#B8941F',
                        }
                      }}
                    >
                      Edit Profile
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Personal Information
                      </Typography>
                      <Stack spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Email sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{userData?.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{adminProfile?.preferredPhone || 'Not provided'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">{adminProfile?.homeAddress || 'Not provided'}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ mr: 1, color: '#877449' }} />
                          <Typography variant="body2">
                            Born: {adminProfile?.dateOfBirth ? formatDate(adminProfile.dateOfBirth) : 'Not provided'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            Gender: {adminProfile?.sex || 'Not provided'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            Parish: {adminProfile?.parish || 'Not provided'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            Preferred Phone: {adminProfile?.preferredPhoneNumber || 'Not provided'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Emergency Contact
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Name</Typography>
                          <Typography variant="body2">
                            {adminProfile?.emergencyContactName || 'Not provided'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Phone</Typography>
                          <Typography variant="body2">
                            {adminProfile?.emergencyContactPhone || 'Not provided'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Relationship</Typography>
                          <Typography variant="body2">
                            {adminProfile?.emergencyContactRelationship || 'Not provided'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Medical Information
                      </Typography>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Medical Conditions</Typography>
                          <Typography variant="body2">
                            {(adminProfile?.medicalConditions || []).length > 0
                              ? (adminProfile?.medicalConditions || []).join(', ')
                              : 'None reported'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Current Medications</Typography>
                          <Typography variant="body2">
                            {adminProfile?.currentMedications || 'None reported'}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">Allergies</Typography>
                          <Typography variant="body2">
                            {adminProfile?.hasAllergies
                              ? adminProfile?.allergicMedications || 'Yes'
                              : 'None reported'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Appointment Information
                      </Typography>
                      {dbProfile?.isScheduled ? (
                        <Stack spacing={2}>
                          <Typography variant="body2">
                            <strong>Date:</strong> {formatDate(dbProfile.date)}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Time:</strong> {dbProfile.time}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Type:</strong> {dbProfile.type}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Duration:</strong> {dbProfile.length} minutes
                          </Typography>
                          <Chip
                            label="Scheduled"
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
            ) : (
              // Edit Mode - Wizard
              <Box>
                {/* Wizard Header */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Edit sx={{ fontSize: 30, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="h5" color="primary">
                          Edit Profile - {userData?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Step {activeWizardStep + 1} of {profileWizardSteps.length}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={handleCancelEdit}
                      startIcon={<Close />}
                      disabled={savingProfile}
                      sx={{ textTransform: 'none' }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>

                {/* Stepper */}
                <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
                  <Stepper activeStep={activeWizardStep} alternativeLabel>
                    {profileWizardSteps.map((step, index) => (
                      <Step key={step.label}>
                        <StepLabel
                          onClick={() => handleWizardStepClick(index)}
                          sx={{ 
                            cursor: 'pointer',
                            '& .MuiStepLabel-label': {
                              fontSize: '0.875rem',
                              fontWeight: activeWizardStep === index ? 600 : 400,
                            }
                          }}
                          StepIconComponent={({ active, completed }) => (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: completed 
                                  ? 'success.main' 
                                  : active 
                                    ? 'primary.main' 
                                    : 'grey.300',
                                color: completed || active ? 'white' : 'grey.600',
                                border: active ? '2px solid' : 'none',
                                borderColor: 'primary.main',
                              }}
                            >
                              {completed ? (
                                <Check sx={{ fontSize: 20 }} />
                              ) : (
                                step.icon
                              )}
                            </Box>
                          )}
                        >
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: activeWizardStep === index ? 600 : 400 }}>
                              {step.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {step.description}
                            </Typography>
                          </Box>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Paper>

                {/* Step Content */}
                <Card elevation={2} sx={{ mb: 4 }}>
                  {renderWizardStepContent(activeWizardStep)}
                </Card>

                {/* Navigation */}
                <Paper elevation={1} sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button
                      disabled={activeWizardStep === 0}
                      onClick={handleWizardBack}
                      startIcon={<NavigateBefore />}
                      sx={{ textTransform: 'none' }}
                      variant="outlined"
                    >
                      Previous
                    </Button>

                    <Chip
                      label={`Step ${activeWizardStep + 1} of ${profileWizardSteps.length}`}
                      color="primary"
                      variant="outlined"
                    />

                    {activeWizardStep === profileWizardSteps.length - 1 ? (
                      <Button 
                        onClick={handleSaveProfile}
                        variant="contained"
                        startIcon={savingProfile ? <CircularProgress size={20} /> : <Save />}
                        disabled={savingProfile}
                        sx={{ 
                          textTransform: 'none',
                          backgroundColor: '#877449',
                          '&:hover': {
                            backgroundColor: '#B8941F',
                          }
                        }}
                      >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleWizardNext}
                        endIcon={<NavigateNext />}
                        sx={{ textTransform: 'none' }}
                        variant="contained"
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1} id="consent-forms-content">
            {viewingConsentForm ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Viewing {viewingConsentForm.formType} Consent Form
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleCloseConsentFormViewer}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Forms
                  </Button>
                </Box>
                <ConsentFormViewer
                  formType={viewingConsentForm.formType}
                  formData={viewingConsentForm.formData}
                  formatDateTime={formatDateTime}
                  inline={true}
                />
              </Box>
            ) : (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Consent Forms</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PictureAsPdf />}
                    onClick={() => generateTabPDF('Consent Forms', 'consent-forms-content')}
                    sx={{ textTransform: 'none' }}
                  >
                    Generate PDF
                  </Button>
                </Box>
                <AdminConsentForms
                  consentForms={consentForms}
                  consentFormsLoading={consentFormsLoading}
                  consentFormsError={consentFormsError}
                  onToggleConsentForm={handleToggleConsentForm}
                  onUnlockConsentForm={handleUnlockConsentForm}
                  onViewConsentForm={handleViewConsentForm}
                  formatDateTime={formatDateTime}
                />
              </Box>
            )}
           </TabPanel>

          <TabPanel value={tabValue} index={2} id="side-effects-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Side Effects</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() => generateTabPDF('Side Effects', 'side-effects-content')}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
            </Box>
            {adminSideEffectsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading side effects data...
                </Typography>
              </Box>
            ) : adminSideEffectsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading side effects: {adminSideEffectsError}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Side Effects - Last 4 Reports
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Click on any side effect to view detailed information
                      </Typography>
                      
                      {adminSideEffects && adminSideEffects.length > 0 ? (
                        <Stack spacing={2}>
                          {adminSideEffects.map((sideEffect, index) => (
                            <Box 
                              key={index}
                              sx={{ 
                                p: 2, 
                                border: '1px solid', 
                                borderColor: selectedSideEffect?._id === sideEffect._id ? 'primary.main' : 'divider', 
                                borderRadius: 2,
                                backgroundColor: selectedSideEffect?._id === sideEffect._id ? 'primary.50' : 'background.paper',
                                cursor: 'pointer',
                                '&:hover': {
                                  backgroundColor: 'action.hover',
                                  borderColor: 'primary.main'
                                }
                              }}
                              onClick={() => handleSideEffectClick(sideEffect)}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" color="primary">
                                  {formatDate(sideEffect.createdAt)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip 
                                    label={sideEffect.reviewed ? 'Reviewed' : 'Pending Review'} 
                                    color={sideEffect.reviewed ? 'success' : 'warning'}
                                    size="small"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {selectedSideEffect?._id === sideEffect._id ? 'Selected' : 'Click to view details'}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary">
                                {sideEffect.sideEffects?.length > 0 
                                  ? `${sideEffect.sideEffects.length} side effect(s) reported`
                                  : 'No specific side effects listed'
                                }
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No side effects found
                          </Typography>
                        <Typography variant="body2" color="text.secondary">
                            No side effects have been reported recently.
                        </Typography>
                        </Box>
                      )}
                  </CardContent>
                </Card>
              </Grid>

                {/* Fixed Details Panel */}
                {selectedSideEffect && (
                  <Grid item xs={12}>
                    <Card sx={{ 
                      position: 'sticky', 
                      bottom: 0, 
                      zIndex: 1,
                      backgroundColor: 'background.paper',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      boxShadow: 3
                    }}>
                  <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" color="primary">
                            Side Effect Details - {formatDate(selectedSideEffect.createdAt)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {!selectedSideEffect.reviewed && (
                              <Button 
                                variant="contained" 
                                color="success"
                                size="small" 
                                onClick={() => handleReviewSideEffect(selectedSideEffect._id)}
                              >
                                Mark as Reviewed
                              </Button>
                            )}
                            {selectedSideEffect.complete && (
                              <Button 
                                variant="contained" 
                                color="warning"
                                size="small" 
                                onClick={() => handleOpenSideEffect(selectedSideEffect._id)}
                              >
                                Reopen
                              </Button>
                            )}
                            <Button 
                              variant="outlined" 
                              size="small" 
                              onClick={() => setSelectedSideEffect(null)}
                            >
                              Close Details
                            </Button>
                          </Box>
                        </Box>

                        {/* Review Status */}
                        <Box sx={{ mb: 3 }}>
                          <Chip 
                            label={selectedSideEffect.reviewed ? 'Reviewed' : 'Pending Review'} 
                            color={selectedSideEffect.reviewed ? 'success' : 'warning'}
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {selectedSideEffect.reviewed ? 'This report has been reviewed' : 'This report is pending review'}
                          </Typography>
                        </Box>

                        {/* Report Information */}
                        <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                            Report Information
                    </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary">Report ID</Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {selectedSideEffect.reportId || 'Not available'}
                            </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary">Report Date</Typography>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedSideEffect.reportDate ? formatDate(selectedSideEffect.reportDate) : 'Not available'}
                            </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary">Status</Typography>
                              <Chip 
                                label={selectedSideEffect.complete ? 'Complete' : 'Incomplete'} 
                                color={selectedSideEffect.complete ? 'success' : 'warning'}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                          </Box>

                        {/* Side Effects List */}
                        {selectedSideEffect.sideEffects && selectedSideEffect.sideEffects.length > 0 ? (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Reported Side Effects ({selectedSideEffect.sideEffects.length})
                            </Typography>
                            <Stack spacing={2}>
                              {selectedSideEffect.sideEffects.map((effect, effectIndex) => (
                                <Paper key={effectIndex} elevation={1} sx={{ p: 2 }}>
                                  <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                    {effect.name || 'Unnamed Side Effect'}
                                  </Typography>
                                  {effect.severity && (
                                    <Chip 
                                      label={`Severity: ${effect.severity}`} 
                                      color={effect.severity === 'Mild' ? 'success' : effect.severity === 'Moderate' ? 'warning' : 'error'}
                                      size="small"
                                      sx={{ mb: 1 }}
                                    />
                                  )}
                                  {effect.description && (
                                    <Typography variant="body2" color="text.secondary">
                                      {effect.description}
                                    </Typography>
                                  )}
                                  {effect.duration && (
                                    <Typography variant="caption" color="text.secondary">
                                      Duration: {effect.duration}
                                    </Typography>
                                  )}
                                </Paper>
                        ))}
                      </Stack>
                          </Box>
                    ) : (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              No Specific Side Effects Listed
                            </Typography>
                      <Typography variant="body2" color="text.secondary">
                              This report was submitted but no specific side effects were detailed.
                      </Typography>
                          </Box>
                        )}

                        {/* Other Side Effect */}
                        {selectedSideEffect.otherSideEffect && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Other Side Effects
                            </Typography>
                            <Typography variant="body2">
                              {selectedSideEffect.otherSideEffect}
                            </Typography>
                          </Box>
                        )}

                        {/* Appetite Information */}
                        {selectedSideEffect.appetiteSuppressed && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Appetite Suppression
                            </Typography>
                            <Typography variant="body2">
                              {selectedSideEffect.appetiteSuppressed}
                            </Typography>
                          </Box>
                        )}

                        {/* Treatment Concerns */}
                        {selectedSideEffect.hasTreatmentConcerns && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Treatment Concerns
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Patient has treatment concerns: {selectedSideEffect.hasTreatmentConcerns}
                            </Typography>
                            {selectedSideEffect.treatmentConcerns && (
                              <Typography variant="body2">
                                <strong>Details:</strong> {selectedSideEffect.treatmentConcerns}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Doctor Contact Request */}
                        {selectedSideEffect.requestDoctorContact && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Doctor Contact Request
                            </Typography>
                            <Chip 
                              label="Patient requested doctor contact" 
                              color="info"
                              sx={{ mb: 1 }}
                            />
                            {selectedSideEffect.contactMessage && (
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                <strong>Message:</strong> {selectedSideEffect.contactMessage}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Timestamps */}
                        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="caption" color="text.secondary">
                            Report Date: {formatDate(selectedSideEffect.createdAt)}
                          </Typography>
                          {selectedSideEffect.updatedAt && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Last Updated: {formatDate(selectedSideEffect.updatedAt)}
                            </Typography>
                          )}
                        </Box>
                  </CardContent>
                </Card>
              </Grid>
                )}
            </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={3} id="weight-logging-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Weight Logging</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() => generateTabPDF('Weight Logging', 'weight-logging-content')}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
            </Box>
            {adminMeasurementsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading measurement data...
                </Typography>
              </Box>
            ) : adminMeasurementsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading measurements: {adminMeasurementsError}
              </Alert>
            ) : (
            <Grid container spacing={3}>
                {/* Summary Cards */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Scale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                        Latest Weight
                    </Typography>
                    <Typography variant="h4" color="primary">
                        {adminMeasurements && adminMeasurements.length > 0 
                          ? `${adminMeasurements[0].weight} kg` 
                          : 'No data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                        Latest BMI
                    </Typography>
                    <Typography variant="h4" color="secondary">
                        {adminMeasurements && adminMeasurements.length > 0 
                          ? adminMeasurements[0].bmi 
                          : 'No data'}
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
                        {adminMeasurements && adminMeasurements.length > 0 
                          ? `${adminMeasurements[0].waistCircumference} cm` 
                          : 'No data'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

                {/* Weight & BMI Progress Chart */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Weight & BMI Progress - Last 4 Weeks
                    </Typography>
                      {adminMeasurements && adminMeasurements.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={adminMeasurements}>
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
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No measurement data found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            No measurements were recorded in the last 4 weeks.
                          </Typography>
                        </Box>
                      )}
                  </CardContent>
                </Card>
              </Grid>

                {/* Detailed Measurements List */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Measurements
                      </Typography>
                      {adminMeasurements && adminMeasurements.length > 0 ? (
                        <Stack spacing={2}>
                          {adminMeasurements.slice(0, 10).map((measurement, index) => (
                            <Box key={index} sx={{ 
                              p: 2, 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 2,
                              backgroundColor: 'background.paper'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" color="primary">
                                  {formatDate(measurement.date)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {measurement.time || 'No time recorded'}
                                </Typography>
                              </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Weight</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {measurement.weight} kg
                                  </Typography>
            </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">BMI</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {measurement.bmi}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Waist</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {measurement.waistCircumference} cm
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Height</Typography>
                                  <Typography variant="body2" fontWeight="medium">
                                    {measurement.height} cm
                                  </Typography>
                                </Grid>
                              </Grid>
                              
                              {measurement.notes && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {measurement.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No measurements found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            No measurements were recorded in the last 4 weeks.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={4} id="medication-tracker-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Medication Tracker</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() => generateTabPDF('Medication Tracker', 'medication-tracker-content')}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
            </Box>
            {adminMedicationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading medication data...
                </Typography>
              </Box>
            ) : adminMedicationsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading medications: {adminMedicationsError}
              </Alert>
            ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Medication Tracker - Last 4 Weeks
                    </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Medication logs for the past 28 days
                      </Typography>
                      
                      {adminMedications && adminMedications.length > 0 ? (
                      <Stack spacing={2}>
                          {adminMedications.map((medication, index) => (
                            <Box key={index} sx={{ 
                              p: 2, 
                              border: '1px solid', 
                              borderColor: 'divider', 
                              borderRadius: 2,
                              backgroundColor: 'background.paper'
                            }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" color="primary">
                                  {medication.medicationName}
                              </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDate(medication.date)}
                                </Typography>
                            </Box>
                              
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Dosage</Typography>
                                  <Typography variant="body2">{medication.dosage || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Frequency</Typography>
                                  <Typography variant="body2">{medication.frequency || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Time</Typography>
                                  <Typography variant="body2">{medication.time || 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                  <Typography variant="caption" color="text.secondary">Status</Typography>
                                  <Chip 
                                    label={medication.taken ? 'Taken' : 'Missed'} 
                                    color={medication.taken ? 'success' : 'error'}
                                    size="small"
                                  />
                                </Grid>
                              </Grid>
                              
                              {medication.notes && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    {medication.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No medication logs found
                          </Typography>
                            <Typography variant="body2" color="text.secondary">
                            No medication entries were recorded in the last 4 weeks.
                            </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={5} id="meal-tracker-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Meal Tracker</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() => generateTabPDF('Meal Tracker', 'meal-tracker-content')}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
            </Box>
            <Grid container spacing={3}>
              {/* Week Navigator */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                      <Box>
                        <Typography variant="h6">
                          Meal Tracker - Week {currentWeek} of 4
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {(() => {
                            const dateRange = getWeekDateRange(currentWeek);
                            return `${dateRange.start} to ${dateRange.end}`;
                          })()}
                            </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                          disabled={currentWeek === 1}
                          startIcon={<NavigateBefore />}
                        >
                          Previous Week
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setCurrentWeek(Math.min(4, currentWeek + 1))}
                          disabled={currentWeek === 4}
                          endIcon={<NavigateNext />}
                        >
                          Next Week
                        </Button>
                      </Box>
                    </Box>
                    
                    {/* Week Progress Indicator */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      {[1, 2, 3, 4].map((week) => {
                        const dateRange = getWeekDateRange(week);
                        return (
                          <Tooltip 
                            key={week}
                            title={`Week ${week}: ${dateRange.start} to ${dateRange.end}`}
                            placement="top"
                          >
                            <Box
                              sx={{
                                flex: 1,
                                height: 8,
                                borderRadius: 1,
                                backgroundColor: week <= currentWeek ? 'primary.main' : 'grey.300',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                  backgroundColor: week <= currentWeek ? 'primary.dark' : 'grey.400',
                                  height: 12
                                }
                              }}
                              onClick={() => setCurrentWeek(week)}
                            />
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Weekly Meal Breakdown */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Week {currentWeek} - Daily Meal Breakdown
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                        ({(() => {
                          const dateRange = getWeekDateRange(currentWeek);
                          return `${dateRange.start} to ${dateRange.end}`;
                        })()})
                      </Typography>
                    </Typography>
                    
                    {mealsLoading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ ml: 2 }}>
                          Loading meal data...
                        </Typography>
                      </Box>
                    ) : mealsError ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        Error loading meals: {mealsError}
                      </Alert>
                    ) : (
                      <Grid container spacing={2}>
                        {(() => {
                          const weekData = getWeekMealsData(currentWeek);
                          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          
                          return daysOfWeek.map((day, dayIndex) => {
                            const dayData = weekData[day] || {
                              breakfast: { name: 'No data', calories: 0 },
                              lunch: { name: 'No data', calories: 0 },
                              dinner: { name: 'No data', calories: 0 },
                              snacks: { name: 'No data', calories: 0 }
                            };
                            
                            const totalCalories = ((dayData.breakfast?.calories || 0) * (dayData.breakfast?.quantity || 1)) + 
                                                 ((dayData.lunch?.calories || 0) * (dayData.lunch?.quantity || 1)) + 
                                                 ((dayData.dinner?.calories || 0) * (dayData.dinner?.quantity || 1)) + 
                                                 ((dayData.snacks?.calories || 0) * (dayData.snacks?.quantity || 1));
                        
                        return (
                          <Grid item xs={12} md={6} lg={4} key={day}>
                            <Paper elevation={1} sx={{ p: 2, height: '100%' }}>
                              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                {day}
                              </Typography>
                              
                              <Stack spacing={1.5}>
                                {/* Breakfast */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Breakfast
                                  </Typography>
                                  <Chip 
                                    label={`${(dayData.breakfast?.calories || 0) * (dayData.breakfast?.quantity || 1)} cal`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  {dayData.breakfast?.name || 'No data'}
                                </Typography>
                                
                                {/* Lunch */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Lunch
                                  </Typography>
                                  <Chip 
                                    label={`${(dayData.lunch?.calories || 0) * (dayData.lunch?.quantity || 1)} cal`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  {dayData.lunch?.name || 'No data'}
                                </Typography>
                                
                                {/* Dinner */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Dinner
                                  </Typography>
                                  <Chip 
                                    label={`${(dayData.dinner?.calories || 0) * (dayData.dinner?.quantity || 1)} cal`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  {dayData.dinner?.name || 'No data'}
                                </Typography>
                                
                                {/* Snacks */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Snacks
                                  </Typography>
                                  <Chip 
                                    label={`${(dayData.snacks?.calories || 0) * (dayData.snacks?.quantity || 1)} cal`} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                  />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  {dayData.snacks?.name || 'No data'}
                                </Typography>
                                
                                <Divider sx={{ my: 1 }} />
                                
                                {/* Total Calories */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    Total
                                  </Typography>
                                  <Chip 
                                    label={`${totalCalories} cal`} 
                                    size="small" 
                                    color="secondary"
                                  />
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        );
                      });
                    })()}
                      </Grid>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={6} id="questions-content">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Questions</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() => generateTabPDF('Questions', 'questions-content')}
                sx={{ textTransform: 'none' }}
              >
                Generate PDF
              </Button>
            </Box>
            {adminQuestionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading questions data...
                </Typography>
              </Box>
            ) : adminQuestionsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading questions: {adminQuestionsError}
              </Alert>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                     
                      
                      {adminQuestions && adminQuestions.length > 0 ? (
                        <Stack spacing={2}>
                          {adminQuestions.map((question, index) => (
                            <Box 
                              key={index}
                              sx={{ 
                                p: 2, 
                                border: '1px solid', 
                                borderColor: 'divider', 
                                borderRadius: 2,
                                backgroundColor: 'background.paper'
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h6" color="primary">
                                  {formatDate(question.createdAt)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {question.answered ? (
                                    <Chip 
                                      label="Answered" 
                                      color="success"
                                      size="small"
                                    />
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      color="error"
                                      size="small"
                                      onClick={() => handleDeleteQuestion(question._id)}
                                      sx={{ textTransform: 'none' }}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </Box>
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                <strong>Question:</strong> {question.questions || 'No question text available'}
                              </Typography>
                              
                              {question.category && (
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="caption" color="text.secondary">Category:</Typography>
                                  <Chip 
                                    label={question.category} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              )}
                              
                              {question.answer && (
                                <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    <strong>Answer:</strong>
                                  </Typography>
                                  <Typography variant="body2">
                                    {question.answer}
                                  </Typography>
                                </Box>
                              )}
                              
                              {question.answeredAt && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                  Answered on: {formatDate(question.answeredAt)}
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No questions found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            No questions have been submitted recently.
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}
          </TabPanel>
        </Card>
        )}

      </Container>

    </>
  );
}

