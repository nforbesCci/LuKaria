'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveSideEffects, fetchSideEffects } from '../../store/slices/sideEffectsSlice';
import Header from '../../components/Header';
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
  Avatar,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Backdrop,
} from '@mui/material';
import {
  Person,
  MedicalServices,
  Report,
  Send,
  Warning,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material';

export default function SideEffects() {
  const { user, isLoading, error } = useUser();
  
  // Access control - Admin or Patient with consultation
  useConsultationAccess();
  const dispatch = useDispatch();
  const sideEffectsState = useSelector((state) => state.sideEffects);
  const [mounted, setMounted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Side effects checklist
    sideEffects: [],
    otherSideEffect: '',
    
    // Appetite suppression
    appetiteSuppressed: '',
    
    // Treatment concerns
    hasTreatmentConcerns: '',
    treatmentConcerns: '',
    
    // Contact request
    requestDoctorContact: false,
    contactMessage: '',
  });

  const sideEffectsList = [
    'Nausea',
    'Vomiting',
    'Bloating',
    'Belching',
    'Constipation',
    'Diarrhoea',
    'Fatigue',
    'Vision Changes',
  ];

  const steps = [
    {
      label: 'Side Effects',
      description: 'Report any side effects',
      icon: <Warning />,
    },
    {
      label: 'Appetite',
      description: 'Appetite changes',
      icon: <CheckCircle />,
    },
    {
      label: 'Treatment Concerns',
      description: 'Treatment concerns',
      icon: <Report />,
    },
    {
      label: 'Contact Request',
      description: 'Doctor contact',
      icon: <Send />,
    },
    {
      label: 'Send Report',
      description: 'Submit to doctor',
      icon: <Send />,
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch side effects from database when component mounts
  useEffect(() => {
    if (user && mounted) {
      console.log('🔄 Fetching side effects from database...');
      dispatch(fetchSideEffects());
    }
  }, [user, mounted, dispatch]);

  // Load the most recent side effects report from Redux store
  useEffect(() => {
    if (sideEffectsState.sideEffects && sideEffectsState.sideEffects.sideEffects?.length > 0) {
      // Get the most recent report (already sorted by createdAt desc from API)
      const mostRecentReport = sideEffectsState.sideEffects.sideEffects[0];
      
      console.log('📋 Loading most recent side effects report:', mostRecentReport);
      
      setFormData({
        sideEffects: mostRecentReport.sideEffects || [],
        otherSideEffect: mostRecentReport.otherSideEffect || '',
        appetiteSuppressed: mostRecentReport.appetiteSuppressed || '',
        hasTreatmentConcerns: mostRecentReport.hasTreatmentConcerns || '',
        treatmentConcerns: mostRecentReport.treatmentConcerns || '',
        requestDoctorContact: mostRecentReport.requestDoctorContact || false,
        contactMessage: mostRecentReport.contactMessage || '',
        reportId: mostRecentReport.reportId,
        reportDate: mostRecentReport.reportDate,
        complete: mostRecentReport.complete || false,
      });
    }
  }, [sideEffectsState.sideEffects]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSideEffectChange = (sideEffect, checked) => {
    setFormData(prev => ({
      ...prev,
      sideEffects: checked 
        ? [...prev.sideEffects, sideEffect]
        : prev.sideEffects.filter(e => e !== sideEffect)
    }));
  };

  const handleSendToDoctor = async () => {
    setIsSending(true);
    
    try {
      // Get assigned doctor information from user metadata or a separate API
      const assignedDoctor = user.user_metadata?.assigned_doctor || {
        name: 'Dr. Kadria Fairclough', // Default doctor - in real app, this would come from user's assigned doctor
        email: 'kadriaf@lukariagroup.com'
      };

      const reportData = {
        ...formData,
        reportDate: new Date().toISOString(),
        reportId: formData.reportId || `SE-${Date.now()}`
      };

      // Save side effects to database using saga
      console.log('💾 Dispatching save side effects action:', reportData);
      dispatch(saveSideEffects(reportData));

    } catch (error) {
      console.error('Error sending report:', error);
      alert('Failed to send report. Please try again or contact support.');
    } finally {
      setIsSending(false);
    }
  };


  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return true; // Side effects are optional
      case 1:
        return formData.appetiteSuppressed !== '';
      case 2:
        return formData.hasTreatmentConcerns !== '' && 
               (formData.hasTreatmentConcerns === 'no' || formData.treatmentConcerns.trim() !== '');
      case 3:
        return true; // Contact request is optional
      case 4:
        return true; // Send report step is always valid
      default:
        return true;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading side effects form...
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
            Error loading form: {error.message}
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
              Please log in to report side effects.
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
            Loading side effects form...
          </Typography>
        </Container>
      </>
    );
  }

  const shouldShowInitialLoadingMask = sideEffectsState.isLoading && !sideEffectsState.sideEffects;

  if (shouldShowInitialLoadingMask) {
    return (
      <>
        <Header />
        <Backdrop
          open
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            flexDirection: 'column',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your side effects history...
          </Typography>
        </Backdrop>
      </>
    );
  }

  // Check if form is complete and should be read-only
  const isFormComplete = formData.complete === true;

  const renderStepContent = (stepIndex) => {
    switch (stepIndex) {
      case 0:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {isFormComplete && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  This report has been submitted and is now read-only. To submit a new report, please contact your healthcare provider.
                </Alert>
              )}
              <Typography variant="h6" gutterBottom>
                Are you experiencing any of the following side effects?
              </Typography>
              <FormGroup>
                <Grid container spacing={1}>
                  {sideEffectsList.map((sideEffect) => (
                    <Grid item xs={12} sm={6} md={4} key={sideEffect}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.sideEffects.includes(sideEffect)}
                            onChange={(e) => handleSideEffectChange(sideEffect, e.target.checked)}
                            disabled={isFormComplete}
                          />
                        }
                        label={sideEffect}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Other side effect (please specify)"
                  multiline
                  rows={3}
                  value={formData.otherSideEffect}
                  onChange={(e) => handleInputChange('otherSideEffect', e.target.value)}
                  placeholder="Please describe any other side effects you're experiencing..."
                  disabled={isFormComplete}
                />
              </Box>
            </CardContent>
          </Card>
        );

      case 1:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {isFormComplete && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  This report has been submitted and is now read-only.
                </Alert>
              )}
              <FormControl component="fieldset" disabled={isFormComplete}>
                <FormLabel component="legend">Has your appetite been adequately suppressed?</FormLabel>
                <RadioGroup
                  row
                  value={formData.appetiteSuppressed}
                  onChange={(e) => handleInputChange('appetiteSuppressed', e.target.value)}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {isFormComplete && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  This report has been submitted and is now read-only.
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl component="fieldset" disabled={isFormComplete}>
                    <FormLabel component="legend">Do you have any concerns regarding your treatment?</FormLabel>
                    <RadioGroup
                      row
                      value={formData.hasTreatmentConcerns}
                      onChange={(e) => handleInputChange('hasTreatmentConcerns', e.target.value)}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                      <FormControlLabel value="no" control={<Radio />} label="No" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.hasTreatmentConcerns === 'yes' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Please describe your concerns"
                      multiline
                      rows={4}
                      value={formData.treatmentConcerns}
                      onChange={(e) => handleInputChange('treatmentConcerns', e.target.value)}
                      placeholder="Please describe any concerns you have about your treatment..."
                      disabled={isFormComplete}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {isFormComplete && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  This report has been submitted and is now read-only.
                </Alert>
              )}
              <Grid container spacing={3}>
                <Grid item xs={12}>
              <FormControl component="fieldset" disabled={isFormComplete}>
                    <FormLabel component="legend">Would you like your doctor to contact you?</FormLabel>
                    <RadioGroup
                      row
                      value={formData.requestDoctorContact ? 'yes' : 'no'}
                      onChange={(e) => handleInputChange('requestDoctorContact', e.target.value === 'yes')}
                    >
                      <FormControlLabel value="yes" control={<Radio />} label="Yes, please contact me" />
                      <FormControlLabel value="no" control={<Radio />} label="No, not necessary" />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                
                {formData.requestDoctorContact && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional message for your doctor"
                      multiline
                      rows={3}
                      value={formData.contactMessage}
                      onChange={(e) => handleInputChange('contactMessage', e.target.value)}
                      placeholder="Any additional information you'd like to share with your doctor..."
                      disabled={isFormComplete}
                    />
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              {isFormComplete ? (
                <>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="bold">
                      This report has been submitted successfully!
                    </Typography>
                    <Typography variant="body2">
                      Your side effects report was sent to your doctor on {formData.reportDate ? new Date(formData.reportDate).toLocaleString() : 'N/A'}. 
                      Report ID: {formData.reportId}
                    </Typography>
                  </Alert>
                  <Typography variant="h6" gutterBottom>
                    Submitted Report Summary
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    Ready to send your side effects report?
                  </Typography>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Review your information below and click "Send to Doctor" to submit your report. 
                    Your assigned doctor will receive an email with all the details you've provided.
                  </Typography>
                </>
              )}

              {/* Report Summary */}
              <Box sx={{ backgroundColor: 'grey.50', p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Report Summary
                </Typography>
                
                {formData.sideEffects.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Reported Side Effects:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {formData.sideEffects.map((sideEffect) => (
                        <Chip key={sideEffect} label={sideEffect} color="warning" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {formData.otherSideEffect && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Other Side Effects:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formData.otherSideEffect}
                    </Typography>
                  </Box>
                )}
                
                {formData.appetiteSuppressed && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Appetite Suppressed: {formData.appetiteSuppressed}
                    </Typography>
                  </Box>
                )}
                
                {formData.hasTreatmentConcerns === 'yes' && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Treatment Concerns:
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {formData.treatmentConcerns}
                    </Typography>
                  </Box>
                )}
                
                {formData.requestDoctorContact && (
                  <Box>
                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 'bold' }}>
                      ✓ Doctor contact requested
                    </Typography>
                    {formData.contactMessage && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Message: {formData.contactMessage}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>

              {!isFormComplete && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Note:</strong> This report will be sent to your assigned doctor via email. 
                    If you need immediate medical attention, please contact your doctor directly or seek emergency care.
                  </Typography>
                </Alert>
              )}
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
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mr: 3, 
                  backgroundColor: 'warning.main' 
                }}
              >
                <MedicalServices sx={{ fontSize: 30 }} />
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
                  Side Effect Tracker
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Stepper Navigation - Desktop */}
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
                      fontWeight: activeStep === index ? 600 : 400 
                    } 
                  }}
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: completed 
                          ? 'success.main' 
                          : active 
                            ? 'primary.main' 
                            : 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      {completed ? (
                        <CheckCircle sx={{ fontSize: 16 }} />
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
                  disabled={!isStepValid(activeStep)}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Next
                  </Box>
                </Button>
              ) : !isFormComplete ? (
                <Button
                  onClick={handleSendToDoctor}
                  disabled={isSending}
                  startIcon={<Send />}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                  size="small"
                  variant="contained"
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {isSending ? 'Sending...' : 'Send'}
                  </Box>
                </Button>
              ) : (
                <Chip 
                  icon={<CheckCircle />} 
                  label="Submitted" 
                  color="success" 
                  variant="filled" 
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Current Step Content */}
        {renderStepContent(activeStep)}

        {/* Navigation Controls - Desktop Only */}
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
              <Chip label={`Step ${activeStep + 1} of ${steps.length}`} color="primary" variant="outlined" />
              {isStepValid(activeStep) && (
                <Chip icon={<CheckCircle />} label="Valid" color="success" variant="filled" size="small" />
              )}
              {isFormComplete && (
                <Chip icon={<CheckCircle />} label="Submitted" color="success" variant="filled" />
              )}
            </Box>

            {activeStep === steps.length - 1 ? (
              !isFormComplete ? (
                <Button
                  variant="contained"
                  onClick={handleSendToDoctor}
                  disabled={isSending}
                  startIcon={<Send />}
                  sx={{ textTransform: 'none' }}
                  size="large"
                >
                  {isSending ? 'Sending...' : 'Send to Doctor'}
                </Button>
              ) : (
                <Chip 
                  icon={<CheckCircle />} 
                  label="Report Submitted" 
                  color="success" 
                  variant="filled" 
                  sx={{ fontSize: '1rem', py: 2.5, px: 2 }}
                />
              )
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<NavigateNext />}
                sx={{ textTransform: 'none' }}
                disabled={!isStepValid(activeStep)}
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
