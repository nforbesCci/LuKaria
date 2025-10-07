'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Grid,
  Paper,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  TextField,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Download,
  Print,
} from '@mui/icons-material';

export default function ConsentForms() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  // Consent forms state
  const [consentForms, setConsentForms] = useState({
    photographConsent: false,
    ozempicConsent: false,
    wegovyConsent: false,
    mounjaroConsent: false,
    telemedicineConsent: false,
  });

  // Photograph consent specific state
  const [photographPermissions, setPhotographPermissions] = useState({
    educatePatients: null, // null = not answered, true = yes, false = no
    educateWebsite: null,
    educateSocialMedia: null,
  });

  const [photographSpecialRequests, setPhotographSpecialRequests] = useState('');
  
  // Patient information fields
  const [patientName, setPatientName] = useState('');
  const [patientDOB, setPatientDOB] = useState('');
  const [consentDate, setConsentDate] = useState('');

  const handleInsertTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setConsentDate(formattedDate);
  };

  // Track signed date
  const [signedDates, setSignedDates] = useState({});

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleConsentChange = (formName) => {
    setConsentForms(prev => ({
      ...prev,
      [formName]: !prev[formName]
    }));

    // Track signed date if checking
    if (!consentForms[formName]) {
      setSignedDates(prev => ({
        ...prev,
        [formName]: new Date().toLocaleString()
      }));
    } else {
      // Remove date if unchecking
      const newDates = { ...signedDates };
      delete newDates[formName];
      setSignedDates(newDates);
    }
  };

  const handleSaveConsents = () => {
    console.log('Saving consent forms:', consentForms);
    console.log('Signed dates:', signedDates);
    console.log('Photograph permissions:', photographPermissions);
    console.log('Photograph special requests:', photographSpecialRequests);
    console.log('Patient information:', {
      name: patientName,
      dob: patientDOB,
      date: consentDate
    });
    // TODO: Save to database
    alert('Consent forms saved successfully!');
  };

  const handlePrintForm = (formName) => {
    console.log('Printing form:', formName);
    // Add print-specific styles
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.innerHTML = `
      @media print {
        /* Hide everything except the print content */
        body * {
          visibility: hidden;
        }
        
        /* Show only the printable content */
        #printable-content-${formName},
        #printable-content-${formName} * {
          visibility: visible;
        }
        
        /* Position the printable content at the top */
        #printable-content-${formName} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        
        /* Hide all buttons during print */
        button,
        .no-print {
          display: none !important;
        }
        
        /* Hide navigation buttons */
        .MuiButton-root {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Trigger print
    window.print();
    
    // Remove the style after printing
    setTimeout(() => {
      const styleElement = document.getElementById('print-styles');
      if (styleElement) {
        styleElement.remove();
      }
    }, 1000);
  };

  const handleDownloadForm = (formName) => {
    console.log('Downloading form:', formName);
    // TODO: Generate PDF download
    alert('Download functionality coming soon!');
  };

  // Consent form data
  const forms = [
    {
      id: 'photographConsent',
      title: 'Photograph Consent',
      description: 'Consent for use of Photographs',
      content: `Before and after photographs are important proofs of the success of your program. Many patients who are contemplating whether a weight loss program might be right for them find photographs useful. Images, including before and after photos, may be used for patient education and for advertising.

Svelte by LuKaria will only use your photographs if you have given permission to do so. Names are not used, and identifying factors are masked when requested. These photos are stored in a secure server in compliance with Jamaica's Data Protection Act. They will be accessed by clinic staff and will not be sold or transferred to any other entity for purposes that have not been agreed to.`,
      hasCustomFields: true,
    },
    {
      id: 'ozempicConsent',
      title: 'Ozempic Consent',
      description: 'Consent for Ozempic (semaglutide) treatment',
      content: 'I consent to treatment with Ozempic (semaglutide) for the management of my condition. I understand that Ozempic is a GLP-1 receptor agonist used to improve blood sugar control and may help with weight management. I acknowledge that I have been informed of potential side effects including nausea, vomiting, diarrhea, constipation, and rare but serious risks such as pancreatitis and thyroid tumors. I understand the importance of regular monitoring and will report any concerning symptoms immediately.',
    },
    {
      id: 'wegovyConsent',
      title: 'Wegovy Consent',
      description: 'Consent for Wegovy (semaglutide) treatment',
      content: 'I consent to treatment with Wegovy (semaglutide) for weight management. I understand that Wegovy is a GLP-1 receptor agonist approved for chronic weight management in adults with obesity or overweight with weight-related medical problems. I acknowledge potential side effects including gastrointestinal symptoms, gallbladder problems, and rare but serious risks such as pancreatitis and thyroid tumors. I understand the importance of lifestyle modifications alongside medication and regular follow-up appointments.',
    },
    {
      id: 'mounjaroConsent',
      title: 'Mounjaro Consent',
      description: 'Consent for Mounjaro (tirzepatide) treatment',
      content: 'I consent to treatment with Mounjaro (tirzepatide) for the management of my condition. I understand that Mounjaro is a dual GIP and GLP-1 receptor agonist that may help with blood sugar control and weight management. I acknowledge potential side effects including gastrointestinal symptoms, injection site reactions, and rare but serious risks such as pancreatitis and thyroid tumors. I understand the importance of proper injection technique and regular monitoring.',
    },
    {
      id: 'telemedicineConsent',
      title: 'TeleMedicine Consent',
      description: 'Consent for telehealth services',
      content: 'I consent to participate in telemedicine consultations and understand that these services are provided via video conferencing and other electronic communications. I acknowledge that telemedicine has limitations compared to in-person visits and that there may be technical issues that could affect the quality of care. I understand that my healthcare provider will determine if telemedicine is appropriate for my condition and may require in-person visits when necessary. I consent to the recording of telemedicine sessions for quality assurance and medical record purposes.',
    },
  ];

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
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
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Access Denied
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Please log in to access consent forms.
          </Typography>
          <Button
            href="/api/auth/login"
            variant="contained"
            size="large"
            sx={{ textTransform: 'none' }}
          >
            Log In
          </Button>
        </Container>
      </>
    );
  }

  if (!mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  const completedForms = Object.values(consentForms).filter(Boolean).length;
  const totalForms = forms.length;

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        {/* Header Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography 
                variant="h4" 
                gutterBottom 
                color="primary"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2.125rem' },
                  fontWeight: 600
                }}
              >
                <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                Consent Forms
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Review and sign medical consent forms
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="h6" color="primary">
                {completedForms} / {totalForms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Forms Completed
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Instructions */}
        <Alert severity="info" sx={{ mb: 3 }}>
          Please review each consent form carefully. Use the tabs on the left to navigate between forms. 
          Check the box on each tab when you complete the form.
        </Alert>

        {/* Vertical Tabs Layout */}
        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', minHeight: 600 }}>
          {/* Vertical Tabs */}
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              minWidth: 280,
              '& .MuiTab-root': {
                alignItems: 'flex-start',
                textAlign: 'left',
                py: 2,
                px: 2,
              }
            }}
          >
            {forms.map((form, index) => (
              <Tab
                key={form.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, justifyContent: 'space-between' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: activeTab === index ? 600 : 400,
                        textAlign: 'left',
                        flex: 1
                      }}
                    >
                      {form.title}
                    </Typography>
                    {consentForms[form.id] && (
                      <CheckCircle 
                        sx={{ 
                          color: 'success.main',
                          fontSize: '1.2rem'
                        }} 
                      />
                    )}
                  </Box>
                }
                sx={{
                  borderLeft: activeTab === index ? 3 : 0,
                  borderColor: 'primary.main',
                  backgroundColor: activeTab === index ? 'rgba(135, 116, 73, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(135, 116, 73, 0.05)',
                  }
                }}
              />
            ))}
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ flex: 1, p: 3 }}>
            {forms.map((form, index) => (
              <Box
                key={form.id}
                role="tabpanel"
                hidden={activeTab !== index}
                sx={{ height: '100%' }}
              >
                {activeTab === index && (
                  <Box>
                    {/* Printable Content Wrapper */}
                    <Box id={`printable-content-${form.id}`}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                            {form.title}
                            {consentForms[form.id] && (
                              <CheckCircle 
                                sx={{ 
                                  ml: 1, 
                                  color: 'success.main', 
                                  verticalAlign: 'middle',
                                  fontSize: '1.5rem'
                                }} 
                              />
                            )}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {form.description}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }} className="no-print">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Print />}
                            onClick={() => handlePrintForm(form.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Print
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Download />}
                            onClick={() => handleDownloadForm(form.id)}
                            sx={{ textTransform: 'none' }}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Form Content */}
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        backgroundColor: '#f5f5f5',
                        minHeight: '300px',
                        maxHeight: '400px',
                        overflowY: 'auto',
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                        {form.content}
                      </Typography>
                    </Paper>

                    {/* Custom Fields for Photograph Consent */}
                    {form.hasCustomFields && form.id === 'photographConsent' && (
                      <>
                        {/* Patient Information Section */}
                       
                        {/* Photography Usage Permissions Section */}
                        <Card elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                          
                          <Grid container spacing={3}>
                          {/* Question 1 */}
                          <Grid item xs={12}>
                            <FormControl component="fieldset">
                              <FormLabel component="legend" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                To educate other patients within our practice
                              </FormLabel>
                              <RadioGroup
                                row
                                value={photographPermissions.educatePatients === null ? '' : photographPermissions.educatePatients ? 'yes' : 'no'}
                                onChange={(e) => setPhotographPermissions(prev => ({
                                  ...prev,
                                  educatePatients: e.target.value === 'yes'
                                }))}
                              >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {/* Question 2 */}
                          <Grid item xs={12}>
                            <FormControl component="fieldset">
                              <FormLabel component="legend" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                To educate patients on our website
                              </FormLabel>
                              <RadioGroup
                                row
                                value={photographPermissions.educateWebsite === null ? '' : photographPermissions.educateWebsite ? 'yes' : 'no'}
                                onChange={(e) => setPhotographPermissions(prev => ({
                                  ...prev,
                                  educateWebsite: e.target.value === 'yes'
                                }))}
                              >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {/* Question 3 */}
                          <Grid item xs={12}>
                            <FormControl component="fieldset">
                              <FormLabel component="legend" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                To educate patients on our social media accounts
                              </FormLabel>
                              <RadioGroup
                                row
                                value={photographPermissions.educateSocialMedia === null ? '' : photographPermissions.educateSocialMedia ? 'yes' : 'no'}
                                onChange={(e) => setPhotographPermissions(prev => ({
                                  ...prev,
                                  educateSocialMedia: e.target.value === 'yes'
                                }))}
                              >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {/* Special Requests */}
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              label="If you have ticked yes to any of the above and have any special requests with regards to how your photos are displayed or used, please list them below:"
                              value={photographSpecialRequests}
                              onChange={(e) => setPhotographSpecialRequests(e.target.value)}
                              placeholder="Enter any special requests here..."
                            />
                          </Grid>

                          {/* Declaration Section */}
                          <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                Declaration
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                I grant permission for photographs of me to be used in the formats indicated above. 
                                I am at least 18 years of age, have read and understand the foregoing statement, 
                                have not been offered inducements to provide permission, and am competent to execute this agreement.
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, backgroundColor: consentForms[form.id] ? 'success.light' : 'transparent', borderRadius: 1, border: '2px solid', borderColor: consentForms[form.id] ? 'success.main' : 'divider' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={consentForms[form.id]}
                                    onChange={() => handleConsentChange(form.id)}
                                    color="success"
                                    sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                                  />
                                }
                                label={
                                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    I have read and agree to this consent form and the declaration above
                                  </Typography>
                                }
                              />
                              {consentForms[form.id] && signedDates[form.id] && (
                                <Typography variant="caption" color="text.secondary">
                                  Signed: {signedDates[form.id]}
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                          </Grid>
                        </Card>

                      {/* Patient Information Card */}
                      <Card elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                          Patient Information
                        </Typography>
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Patient's Name"
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="Enter patient's full name"
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Patient's Date of Birth"
                              value={patientDOB}
                              onChange={(e) => setPatientDOB(e.target.value)}
                              InputLabelProps={{
                                shrink: true,
                              }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                              <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={consentDate}
                                onChange={(e) => setConsentDate(e.target.value)}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                              />
                              <Button
                                variant="outlined"
                                onClick={handleInsertTodayDate}
                                sx={{ 
                                  textTransform: 'none',
                                  minWidth: '120px',
                                  height: '56px'
                                }}
                              >
                                Today's Date
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                      </>
                    )}

                    {/* Consent Checkbox for non-photograph forms */}
                    {form.id !== 'photographConsent' && (
                      <Card 
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: consentForms[form.id] ? 'success.light' : 'background.paper',
                          border: '2px solid',
                          borderColor: consentForms[form.id] ? 'success.main' : 'divider',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={consentForms[form.id]}
                                onChange={() => handleConsentChange(form.id)}
                                color="success"
                                sx={{ '& .MuiSvgIcon-root': { fontSize: 28 } }}
                              />
                            }
                            label={
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                I have read and agree to this consent form
                              </Typography>
                            }
                          />
                          {consentForms[form.id] && signedDates[form.id] && (
                            <Typography variant="caption" color="text.secondary">
                              Signed: {signedDates[form.id]}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    )}
                    
                    </Box>
                    {/* End Printable Content Wrapper */}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }} className="no-print">
                      <Button
                        variant="outlined"
                        onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                        disabled={activeTab === 0}
                        sx={{ textTransform: 'none' }}
                      >
                        Previous Form
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => setActiveTab(Math.min(forms.length - 1, activeTab + 1))}
                        disabled={activeTab === forms.length - 1}
                        sx={{
                          textTransform: 'none',
                          backgroundColor: '#877449',
                          '&:hover': {
                            backgroundColor: '#B8941F',
                          }
                        }}
                      >
                        Next Form
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/dashboard')}
            sx={{ textTransform: 'none' }}
          >
            Back to Dashboard
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleSaveConsents}
            disabled={completedForms === 0}
            sx={{
              textTransform: 'none',
              backgroundColor: '#877449',
              '&:hover': {
                backgroundColor: '#B8941F',
              }
            }}
          >
            Save Consent Forms ({completedForms})
          </Button>
        </Box>
      </Container>
    </>
  );
}

