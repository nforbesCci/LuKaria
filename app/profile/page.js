'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Link from 'next/link';
import { useAppDispatch } from '../../store/hooks';
import { updatePreAppointmentTask } from '../../store/slices/appointmentSlice';
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
} from '@mui/icons-material';

export default function Profile() {
  const { user, isLoading, error } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const dispatch = useAppDispatch();

  // Schedule protection - prevent access to profile if schedule not completed
  useScheduleProtection();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mark medical profile task as complete when profile is saved
  const handleProfileSave = () => {
    dispatch(updatePreAppointmentTask({ 
      taskKey: 'completeMedicalProfile', 
      completed: true 
    }));
    setIsEditing(false);
  };

  // Pre-populate form with Auth0 user data when available
  useEffect(() => {
    if (user) {
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
    }
  }, [user]);
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
  };

  const handleMedicalConditionChange = (condition, checked) => {
    setFormData(prev => ({
      ...prev,
      medicalConditions: checked 
        ? [...prev.medicalConditions, condition]
        : prev.medicalConditions.filter(c => c !== condition)
    }));
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
    
    setIsEditing(false);
    // Show success message - you could add a snackbar or alert here
    alert('Profile saved successfully!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setActiveStep(0);
    // Reset form data if needed
  };

  // Wizard navigation functions
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  // Check if current step is valid
  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Personal Info
        return formData.name && formData.preferredEmail;
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
                    disabled={!isEditing}
                    variant="outlined"
                    error={!formData.name && isEditing}
                    helperText={!formData.name && isEditing ? 'Name is required' : ''}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Date of Birth *"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                    error={!formData.dateOfBirth && isEditing}
                    helperText={!formData.dateOfBirth && isEditing ? 'Date of birth is required' : ''}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl component="fieldset" disabled={!isEditing}>
                    <FormLabel component="legend">Sex</FormLabel>
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
                    disabled={!isEditing}
                    error={!formData.preferredPhone && isEditing}
                    helperText={!formData.preferredPhone && isEditing ? 'Phone number is required' : ''}
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
                    disabled={!isEditing}
                    error={!formData.preferredEmail && isEditing}
                    helperText={!formData.preferredEmail && isEditing ? 'Email is required' : ''}
                    InputProps={{
                      startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
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
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: <HomeIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth disabled={!isEditing} error={!formData.parish && isEditing}>
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
                    {!formData.parish && isEditing && (
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
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    value={formData.nextOfKinPhone}
                    onChange={(e) => handleInputChange('nextOfKinPhone', e.target.value)}
                    disabled={!isEditing}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    value={formData.nextOfKinRelationship}
                    onChange={(e) => handleInputChange('nextOfKinRelationship', e.target.value)}
                    disabled={!isEditing}
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
                            disabled={!isEditing}
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
                    disabled={!isEditing}
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
                  <FormControl component="fieldset" disabled={!isEditing}>
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
                      label="Allergic Medications (please list)"
                      multiline
                      rows={3}
                      value={formData.allergicMedications}
                      onChange={(e) => handleInputChange('allergicMedications', e.target.value)}
                      disabled={!isEditing}
                      placeholder="List all medications you are allergic to..."
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Medications"
                    multiline
                    rows={4}
                    value={formData.currentMedications}
                    onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                    disabled={!isEditing}
                    placeholder="List all current medications, dosages, and frequency..."
                  />
                </Grid>
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
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={user.picture}
                alt={user.name}
                sx={{ width: 60, height: 60, mr: 3 }}
              >
                <Person sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '2.125rem' },
                    fontWeight: 600
                  }}
                >
                  Medical Profile
                </Typography>
              </Box>
            </Box>
            <Box>
              {!isEditing ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Edit Profile
                  </Box>
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    sx={{ 
                      textTransform: 'none',
                      minWidth: { xs: 'auto', sm: '64px' },
                      px: { xs: 1, sm: 2 }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      Save Profile
                    </Box>
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Cancel />}
                    onClick={handleCancel}
                    sx={{ 
                      textTransform: 'none',
                      minWidth: { xs: 'auto', sm: '64px' },
                      px: { xs: 1, sm: 2 }
                    }}
                  >
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      Cancel
                    </Box>
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </Paper>

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
                  onClick={() => setIsEditing(true)}
                  startIcon={<Edit />}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                  size="small"
                  variant="contained"
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Edit
                  </Box>
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
              variant={isEditing ? 'contained' : 'outlined'}
            >
              Previous
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Step ${activeStep + 1} of ${steps.length}`}
                color="primary"
                variant="outlined"
              />
              {isEditing && isStepValid(activeStep) && (
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
              isEditing ? (
                <Button
                  variant="contained"
                  onClick={handleSave}
                  startIcon={<Save />}
                  sx={{ textTransform: 'none' }}
                >
                  Save Profile
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Edit Profile
                </Button>
              )
            ) : (
              <Button
                variant={isEditing ? 'contained' : 'outlined'}
                onClick={handleNext}
                endIcon={<NavigateNext />}
                sx={{ textTransform: 'none' }}
              >
                Next
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
}