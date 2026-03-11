'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useBasicAccess } from '../../hooks/useAccessControl';
import { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import PageTitle from '../../components/PageTitle';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updatePreAppointmentTaskAction } from '../../store/slices/appointmentSlice';
import { saveProfile, fetchProfile, resetSaveFlag } from '../../store/slices/profileSlice';
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
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  Paper,
  Divider,
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home as HomeIcon,
  LocalHospital,
  Medication,
  HealthAndSafety,
  Save,
  Edit,
  Cancel,
  NavigateNext,
  NavigateBefore,
  Check,
  Lock,
  CalendarToday,
} from '@mui/icons-material';

export default function Profile() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [showProfileView, setShowProfileView] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const hasFetchedProfile = useRef(false);
  
  // Access control - only Admin and Patient can access
  useBasicAccess();
  
  // Redux state
  const profileState = useAppSelector((state) => state.profile);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    dateOfBirth: '',
    sex: '',
    preferredPhone: '',
    preferredEmail: '',
    homeAddress: '',
    parish: '',
    
    // Emergency Contact
    nextOfKinName: '',
    nextOfKinPhone: '',
    nextOfKinRelationship: '',
    
    
    // Medical Conditions
    medicalConditions: [],
    otherMedicalCondition: '',
    hasAllergies: false,
    allergicMedications: '',
    currentMedications: '',
  });

  // Track which fields are from Auth0 and should be disabled
  const [auth0Fields, setAuth0Fields] = useState({
    name: false,
    preferredEmail: false
  });

  // Track if any edits were made to determine button text
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);

  // Separate effect for fetching profile - only run once when mounted and user is available
  useEffect(() => {
    if (mounted && user && !isLoading && !hasFetchedProfile.current) {
      console.log('📊 Profile: Loading profile data (first time only)...');
      console.log('👤 Profile: User object:', user);
      
      // Mark as fetched BEFORE dispatching to prevent race conditions
      hasFetchedProfile.current = true;
      
      // Fetch profile data
      dispatch(fetchProfile());
    }
  }, [mounted, user, isLoading, dispatch]);

  // Separate effect to reset isSaved flag on mount
  useEffect(() => {
    if (profileState.isSaved) {
      console.log('🔄 Profile: Resetting isSaved flag to prevent unwanted redirect');
      dispatch(resetSaveFlag());
    }
  }, []); // Run only once on mount

  // Handle profile save success/failure
  useEffect(() => {
    if (profileState.isSaved && hasUnsavedChanges) {
      console.log('✅ Profile: Profile saved successfully, redirecting to dashboard...');
      // Reset unsaved changes flag
      setHasUnsavedChanges(false);
      // Redirect to dashboard after successful save
      router.push('/dashboard');
    }
    if (profileState.error) {
      console.error('❌ Profile: Error in profile state:', profileState.error);
      alert(`Error with profile: ${profileState.error}`);
    }
  }, [profileState.isSaved, profileState.error, router, hasUnsavedChanges]);

  // Debug profile state changes
  useEffect(() => {
    console.log('📊 Profile: Profile state changed:', {
      isLoading: profileState.isLoading,
      isLoaded: profileState.isLoaded,
      error: profileState.error,
      profile: profileState.profile
    });
  }, [profileState]);

  // Prevent leaving page if required fields are not filled
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Check if any required fields are empty
      const hasEmptyRequiredFields = !formData.name || 
                                   !formData.preferredEmail || 
                                   !formData.preferredPhone || 
                                   !formData.dateOfBirth || 
                                   !formData.sex || 
                                   !formData.parish;
      
      if (hasEmptyRequiredFields) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData]);

  // Mark medical profile task as complete when profile is saved
  const handleProfileSave = () => {
    // Check if already saving
    if (profileState.isLoading) {
      console.log('⏳ Profile: Already saving, please wait...');
      return;
    }
    
    // Check if all required fields are filled before saving
    const hasEmptyRequiredFields = !formData.name || 
                                 !formData.preferredEmail || 
                                 !formData.preferredPhone || 
                                 !formData.dateOfBirth || 
                                 !formData.sex || 
                                 !formData.parish;
    
    if (hasEmptyRequiredFields) {
      alert('Please fill in all required fields before saving.');
      return;
    }
    
    // If no changes were made, just redirect to dashboard
    if (!hasUnsavedChanges) {
      console.log('🔄 Profile: No changes made, redirecting to dashboard...');
      router.push('/dashboard');
      return;
    }
    
    console.log('🔄 Profile: Dispatching save profile saga with data:', formData);
    
    // Dispatch the saga to save profile to MongoDB
    dispatch(saveProfile(formData));
    
    // Mark medical profile task as complete
    dispatch(updatePreAppointmentTaskAction({ 
      taskKey: 'completeMedicalProfile', 
      completed: true 
    }));
  };

  // Pre-populate form with Auth0 user data when available
  useEffect(() => {
    if (user) {
      const hasAuth0Name = !!(user.name || user.nickname);
      const hasAuth0Email = !!user.email;
      
      setFormData(prev => ({
        ...prev,
        name: user.name || user.nickname || '',
        preferredEmail: user.email || '',
        // Auth0 might have additional fields in user_metadata or app_metadata
        preferredPhone: user.phone_number || user.user_metadata?.phone_number || '',
        dateOfBirth: user.birthdate || user.user_metadata?.birthdate || '',
        sex: user.gender || user.user_metadata?.gender || '',
        homeAddress: user.address || user.user_metadata?.address || '',
        // Emergency contact info if available in Auth0
        nextOfKinName: user.user_metadata?.emergency_contact_name || '',
        nextOfKinPhone: user.user_metadata?.emergency_contact_phone || '',
        nextOfKinRelationship: user.user_metadata?.emergency_contact_relationship || '',
        // Medical conditions if stored in Auth0
        medicalConditions: user.user_metadata?.medical_conditions || [],
        otherMedicalCondition: user.user_metadata?.other_medical_condition || '',
        hasAllergies: user.user_metadata?.has_allergies || false,
        allergicMedications: user.user_metadata?.allergic_medications || '',
        currentMedications: user.user_metadata?.current_medications || '',
        // Doctor assignment
        assignedDoctor: user.user_metadata?.assigned_doctor || {
          name: 'Dr. Smith',
          email: 'doctor@healthcare.com',
          phone: '(555) 123-4567'
        },
      }));
      
      // Set which fields are from Auth0 and should be disabled
      setAuth0Fields({
        name: false, // Always allow name to be editable
        preferredEmail: hasAuth0Email
      });
      
      console.log('🔐 Profile: Auth0 fields detected:', {
        name: hasAuth0Name,
        preferredEmail: hasAuth0Email
      });
    }
  }, [user]);

  // Load profile data from Redux store if it exists
  useEffect(() => {
    if (profileState.isLoaded && profileState.profile ) {
      console.log('👤 Profile: Loading existing profile data from store:', profileState.profile);
      
      const profileData = profileState.profile;
      setFormData(prev => ({
        ...prev,
        // Personal Information - Allow profile name to override Auth0 name
        name: profileData.name || prev.name, // Use saved profile name if available, otherwise use Auth0 name
        preferredEmail: prev.preferredEmail, // Keep Auth0 email if available
        preferredPhone: profileData.preferredPhone || prev.preferredPhone,
        dateOfBirth: profileData.dateOfBirth || prev.dateOfBirth,
        sex: profileData.sex || prev.sex,
        homeAddress: profileData.homeAddress || prev.homeAddress,
        parish: profileData.parish || prev.parish,
        
        // Emergency Contact
        nextOfKinName: profileData.nextOfKinName || prev.nextOfKinName,
        nextOfKinPhone: profileData.nextOfKinPhone || prev.nextOfKinPhone,
        nextOfKinRelationship: profileData.nextOfKinRelationship || prev.nextOfKinRelationship,
        
        // Medical History
        medicalConditions: profileData.medicalConditions || prev.medicalConditions,
        otherMedicalCondition: profileData.otherMedicalCondition || prev.otherMedicalCondition,
        hasAllergies: profileData.hasAllergies || prev.hasAllergies,
        allergicMedications: profileData.allergicMedications || prev.allergicMedications,
        
        // Current Medications
        currentMedications: profileData.currentMedications || prev.currentMedications,
        
        // Doctor assignment
        assignedDoctor: profileData.assignedDoctor || prev.assignedDoctor,
      }));
      
      console.log('✅ Profile: Form data updated with existing profile');
    } else if (profileState.isLoaded && !profileState.profile?.exists) {
      console.log('📝 Profile: No existing profile found, using Auth0 data only');
    }
  }, [profileState.isLoaded, profileState.profile]);

  // When profile is loaded from server and has required fields, show profile summary first
  useEffect(() => {
    const p = profileState.profile;
    if (
      profileState.isLoaded &&
      p &&
      p.name &&
      (p.preferredEmail || user?.email) &&
      p.preferredPhone &&
      p.dateOfBirth &&
      p.sex &&
      p.parish
    ) {
      setShowProfileView(true);
    }
  }, [
    profileState.isLoaded,
    profileState.profile,
    user?.email,
  ]);

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

  // Wizard steps configuration
  const steps = [
    {
      label: 'Personal Info',
      icon: <Person />,
      description: 'Basic personal information'
    },
    {
      label: 'Emergency Contact',
      icon: <Phone />,
      description: 'Next of kin information'
    },
    {
      label: 'Medical History',
      icon: <LocalHospital />,
      description: 'Medical conditions and history'
    },
    {
      label: 'Medications',
      icon: <Medication />,
      description: 'Current medications and allergies'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Mark that changes have been made
    setHasUnsavedChanges(true);
  };

  const handleMedicalConditionChange = (condition, checked) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: checked 
        ? [...prev.medicalConditions, condition]
        : prev.medicalConditions.filter(c => c !== condition)
    }));
    // Mark that changes have been made
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // Validate required fields
    if (!formData.name || !formData.dateOfBirth || !formData.preferredEmail || !formData.preferredPhone || !formData.parish) {
      alert('Please fill in all required fields (Name, Date of Birth, Email, Phone Number, and Parish)');
      return;
    }

    // Here you would typically save to a database or Auth0 user metadata
    console.log('Saving profile data:', formData);
    
    // Mark medical profile task as complete
    handleProfileSave();
    
    // Example of how you might save to Auth0 user metadata:
    // You would need to implement an API endpoint to update Auth0 user metadata
    // const updateUserMetadata = async () => {
    //   const response = await fetch('/api/user/update-metadata', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       user_metadata: {
    //         phone_number: formData.preferredPhone,
    //         birthdate: formData.dateOfBirth,
    //         gender: formData.sex,
    //         address: formData.homeAddress,
    //         emergency_contact_name: formData.nextOfKinName,
    //         emergency_contact_phone: formData.nextOfKinPhone,
    //         emergency_contact_relationship: formData.nextOfKinRelationship,
    //         medical_conditions: formData.medicalConditions,
    //         other_medical_condition: formData.otherMedicalCondition,
    //         has_allergies: formData.hasAllergies,
    //         allergic_medications: formData.allergicMedications,
    //         current_medications: formData.currentMedications,
    //       }
    //     })
    //   });
    //   return response.json();
    // };
    
    // Show success message - you could add a snackbar or alert here
    alert('Profile saved successfully!');
  };


  // Wizard navigation functions
  const handleNext = () => {
    // Check if current step is valid before allowing next
    if (!isStepValid(activeStep)) {
      alert('Please fill in all required fields before proceeding.');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step) => {
    // Check if current step is valid before allowing navigation to other steps
    if (step > activeStep && !isStepValid(activeStep)) {
      alert('Please fill in all required fields before proceeding to the next step.');
      return;
    }
    setActiveStep(step);
  };

  // Check if all required fields are filled
  const areAllRequiredFieldsFilled = () => {
    return formData.name && 
           formData.preferredEmail && 
           formData.preferredPhone && 
           formData.dateOfBirth && 
           formData.sex && 
           formData.parish;
  };

  // Check if current step is valid
  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Personal Info
        return formData.name && formData.preferredEmail && formData.preferredPhone && formData.dateOfBirth && formData.sex && formData.parish;
      case 1: // Emergency Contact
        return true; // Emergency contact is optional
      case 2: // Medical History
        return true; // Medical conditions are optional
      case 3: // Medications
        return true; // Medications are optional
      default:
        return false;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading profile: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom color="primary">
              Access Denied
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Please log in to view your profile.
            </Typography>
            <Button
              href="/api/auth/login"
              variant="contained"
              size="large"
              startIcon={<Person />}
              sx={{ textTransform: 'none' }}
            >
              Log In
            </Button>
          </Box>
        </Container>
      </>
    );
  }

  // Don't render the form until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading profile...
          </Typography>
        </Container>
      </>
    );
  }

  // Render individual step content
  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Personal Information
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    variant="outlined"
                    error={!formData.name}
                    helperText={!formData.name ? 'Name is required' : ''}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Date of Birth *"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    error={!formData.dateOfBirth}
                    helperText={!formData.dateOfBirth ? 'Date of birth is required' : ''}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: '#877449' }} />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{
                      max: new Date().toISOString().split('T')[0]
                    }}
                    sx={{
                      '& .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                        filter: 'invert(55%) sepia(18%) saturate(1019%) hue-rotate(8deg) brightness(92%) contrast(85%)',
                        cursor: 'pointer',
                      },
                      '& .MuiOutlinedInput-root': {
                        '&:hover .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                          filter: 'invert(55%) sepia(18%) saturate(1019%) hue-rotate(8deg) brightness(92%) contrast(85%)',
                        },
                        '&.Mui-focused .MuiInputBase-input::-webkit-calendar-picker-indicator': {
                          filter: 'invert(55%) sepia(18%) saturate(1019%) hue-rotate(8deg) brightness(92%) contrast(85%)',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Sex *</FormLabel>
                    <RadioGroup
                      row
                      value={formData.sex}
                      onChange={(e) => handleInputChange('sex', e.target.value)}
                    >
                      <FormControlLabel value="male" control={<Radio />} label="Male" />
                      <FormControlLabel value="female" control={<Radio />} label="Female" />
                      <FormControlLabel value="other" control={<Radio />} label="Other" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Phone Number *"
                    type="tel"
                    value={formData.preferredPhone}
                    onChange={(e) => handleInputChange('preferredPhone', e.target.value)}
                    error={!formData.preferredPhone}
                    helperText={!formData.preferredPhone ? 'Phone number is required' : ''}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Preferred Email Address *"
                    type="email"
                    value={formData.preferredEmail}
                    onChange={(e) => handleInputChange('preferredEmail', e.target.value)}
                    error={!formData.preferredEmail}
                    helperText={auth0Fields.preferredEmail ? 'This field is managed by your account settings' : (!formData.preferredEmail ? 'Email is required' : '')}
                    disabled={auth0Fields.preferredEmail}
                    InputProps={{
                      startAdornment: auth0Fields.preferredEmail ? <Lock sx={{ mr: 1, color: 'text.secondary' }} /> : <Email sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Home Address"
                    multiline
                    rows={3}
                    value={formData.homeAddress}
                    onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth error={!formData.parish}>
                    <InputLabel>Parish *</InputLabel>
                    <Select
                      value={formData.parish}
                      onChange={(e) => handleInputChange('parish', e.target.value)}
                      label="Parish *"
                    >
                      <MenuItem value="">
                        <em>Select Parish</em>
                      </MenuItem>
                      {jamaicaParishes.map((parish) => (
                        <MenuItem key={parish} value={parish}>
                          {parish}
                        </MenuItem>
                      ))}
                    </Select>
                    {!formData.parish && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        Parish is required
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 1: // Emergency Contact
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Name"
                    value={formData.nextOfKinName}
                    onChange={(e) => handleInputChange('nextOfKinName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    value={formData.nextOfKinPhone}
                    onChange={(e) => handleInputChange('nextOfKinPhone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={formData.nextOfKinRelationship}
                    onChange={(e) => handleInputChange('nextOfKinRelationship', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 2: // Medical History
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom>
                Have you been diagnosed with any of the following illnesses?
              </Typography>
              <FormGroup>
                <Grid container spacing={1}>
                  {medicalConditionsList.map((condition) => (
                    <Grid item xs={12} sm={6} md={4} key={condition}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.medicalConditions.includes(condition)}
                            onChange={(e) => handleMedicalConditionChange(condition, e.target.checked)}
                          />
                        }
                        label={condition}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
              
              {formData.medicalConditions.includes('Other') && (
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Please specify other medical illnesses"
                    multiline
                    rows={3}
                    value={formData.otherMedicalCondition}
                    onChange={(e) => handleInputChange('otherMedicalCondition', e.target.value)}
                    placeholder="Please describe your other medical illnesses..."
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 3: // Medications
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                    List your current medications
                  </Typography>
                  <TextField
                    fullWidth
                    label="Current Medications"
                    multiline
                    rows={4}
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    placeholder="List all current medications, dosages, and frequency..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">Are you allergic to any medications?</FormLabel>
                    <RadioGroup
                      row
                      value={formData.hasAllergies ? 'yes' : 'no'}
                      onChange={(e) => handleInputChange('hasAllergies', e.target.value === 'yes')}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.hasAllergies && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Medication and other allergies"
                      multiline
                      rows={3}
                      value={formData.allergicMedications}
                      onChange={(e) => handleInputChange('allergicMedications', e.target.value)}
                      placeholder="List all medications and other allergies..."
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <PageTitle
          actions={
            showProfileView ? (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setShowProfileView(false)}
                sx={{
                  textTransform: 'none',
                  backgroundColor: '#877449',
                  color: '#000',
                  '&:hover': { backgroundColor: '#6b5d3a' },
                }}
              >
                Edit Profile
              </Button>
            ) : undefined
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={user.picture}
              alt={user.name}
              sx={{ width: 60, height: 60, mr: 3 }}
            >
              <Person sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography
              variant="h4"
              color="primary"
              sx={{
                fontSize: { xs: '1.25rem', sm: '2.125rem' },
                fontWeight: 600,
              }}
            >
              Medical Profile
            </Typography>
          </Box>
        </PageTitle>

        {/* Profile summary view when profile is configured */}
        {showProfileView ? (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1">{formData.name}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1">{formData.dateOfBirth}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Sex</Typography>
                  <Typography variant="body1">{formData.sex ? String(formData.sex).charAt(0).toUpperCase() + formData.sex.slice(1) : '—'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Preferred Phone</Typography>
                  <Typography variant="body1">{formData.preferredPhone}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Preferred Email</Typography>
                  <Typography variant="body1">{formData.preferredEmail}</Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="caption" color="text.secondary">Home Address</Typography>
                  <Typography variant="body1">{formData.homeAddress || '—'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Parish</Typography>
                  <Typography variant="body1">{formData.parish}</Typography>
                </Grid>

                <Grid item xs={12} sx={{ pt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                    Emergency Contact
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{formData.nextOfKinName || '—'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{formData.nextOfKinPhone || '—'}</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="caption" color="text.secondary">Relationship</Typography>
                  <Typography variant="body1">{formData.nextOfKinRelationship || '—'}</Typography>
                </Grid>

                <Grid item xs={12} sx={{ pt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                    Medical History
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Medical Conditions</Typography>
                  <Typography variant="body1">
                    {formData.medicalConditions?.length > 0 ? formData.medicalConditions.join(', ') : '—'}
                    {formData.otherMedicalCondition ? ` (${formData.otherMedicalCondition})` : ''}
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ pt: 2 }}>
                  <Typography variant="h6" sx={{ color: 'primary.main', mb: 2 }}>
                    Medications & Allergies
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Allergies</Typography>
                  <Typography variant="body1">{formData.hasAllergies ? 'Yes' : 'No'}</Typography>
                </Grid>
                {formData.hasAllergies && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Allergic medications</Typography>
                    <Typography variant="body1">{formData.allergicMedications || '—'}</Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Current medications</Typography>
                  <Typography variant="body1">{formData.currentMedications || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <>
        {/* Wizard Stepper - Desktop */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, display: { xs: 'none', md: 'block' } }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{ 
                    cursor: 'pointer',
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: activeStep === index ? 600 : 400,
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
                    <Typography variant="subtitle2" sx={{ fontWeight: activeStep === index ? 600 : 400 }}>
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

        {/* Current Step Display - Mobile */}
        <Paper elevation={1} sx={{ p: 3, mb: 4, display: { xs: 'block', md: 'none' }, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                {steps[activeStep].icon}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.0rem' }}>
                  {steps[activeStep].label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Step {activeStep + 1} of {steps.length}
                </Typography>
              </Box>
            </Box>
            
            {/* Mobile Step Navigation */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<NavigateBefore />}
                sx={{ 
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: '64px' },
                  px: { xs: 1, sm: 2 }
                }}
                size="small"
                variant="outlined"
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Previous
                </Box>
              </Button>
              
              {activeStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  endIcon={<NavigateNext />}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                  size="small"
                  variant="contained"
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Next
                  </Box>
                </Button>
              ) : (
                <Button
                  onClick={handleProfileSave}
                  startIcon={<Save />}
                  disabled={!areAllRequiredFieldsFilled() || profileState.isLoading}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 },
                    backgroundColor: areAllRequiredFieldsFilled() && !profileState.isLoading ? '#877449' : '#ccc',
                    color: areAllRequiredFieldsFilled() && !profileState.isLoading ? '#000000' : '#666',
                    '&:hover': {
                      backgroundColor: areAllRequiredFieldsFilled() && !profileState.isLoading ? '#6b5d3a' : '#ccc',
                    },
                    '&:disabled': {
                      backgroundColor: '#ccc',
                      color: '#666',
                    }
                  }}
                  size="small"
                  variant="contained"
                >
                  {profileState.isLoading ? 'Saving...' : 'Save'}
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Current Step Content */}
        {renderStepContent(activeStep)}

        {/* Wizard Navigation - Desktop Only */}
        <Paper elevation={1} sx={{ p: 3, display: { xs: 'none', md: 'block' }, backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<NavigateBefore />}
              sx={{ textTransform: 'none' }}
              variant="outlined"
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Step ${activeStep + 1} of ${steps.length}`}
                color="primary"
                variant="outlined"
              />
              {isStepValid(activeStep) && (
                <Chip
                  icon={<Check />}
                  label="Valid"
                  color="success"
                  variant="filled"
                  size="small"
                />
              )}
            </Box>

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleProfileSave}
                startIcon={<Save />}
                disabled={!areAllRequiredFieldsFilled() || profileState.isLoading}
                sx={{ 
                  textTransform: 'none',
                  backgroundColor: areAllRequiredFieldsFilled() && !profileState.isLoading ? '#877449' : '#ccc',
                  color: areAllRequiredFieldsFilled() && !profileState.isLoading ? '#000000' : '#666',
                  '&:hover': {
                    backgroundColor: areAllRequiredFieldsFilled() && !profileState.isLoading ? '#6b5d3a' : '#ccc',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
                  }
                }}
              >
                {profileState.isLoading ? 'Saving...' : areAllRequiredFieldsFilled() ? (hasUnsavedChanges ? 'Save Profile' : 'To Dashboard') : 'Fill Required Fields'}
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={handleNext}
                endIcon={<NavigateNext />}
                sx={{ textTransform: 'none' }}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
          </>
        )}
      </Container>
    </>
  );
}