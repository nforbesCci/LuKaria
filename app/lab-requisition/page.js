'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAdminAccess } from '../../hooks/useAccessControl';
import Header from '../../components/Header';
import Image from 'next/image';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Grid,
  TextField,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Backdrop,
} from '@mui/material';
import {
  ArrowBack,
  PictureAsPdf,
  Send,
  MedicalServices,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useDispatch, useSelector } from 'react-redux';
import { clearPdfState } from '../../store/slices/pdfSlice';
import { fetchAdminProfileAction } from '../../store/slices/adminSlice';

export default function LabRequisition() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  
  // Access control - only Admin and Doctor can access
  useAdminAccess();
  const { isGenerating, isSending, error: pdfError, success: pdfSuccess } = useSelector(state => state.pdf);
 
  const selectedUser = useSelector((state) => state.admin.selectedUser);
  const profile = useSelector((state) => state.admin.adminProfile);
  const profileLoading = useSelector((state) => state.admin.adminProfileLoading);
    

  // Check user roles for lab requisition access
  const userRoles = user?.['https://lukariagroup.com/roles'] || [];
  const hasLabAccess = userRoles.some(role => {
    const roleLower = role.toLowerCase();
    const isAdmin = roleLower === 'admin';
    const isDoctor = roleLower === 'doctor';
    const isDoctorGroup = roleLower === 'doctor group' || roleLower === 'doctors' || roleLower === 'doctor_group';
    const isAdminGroup = roleLower === 'admin group' || roleLower === 'admins' || roleLower === 'admin_group';
    
    return isAdmin || isDoctor || isDoctorGroup || isAdminGroup;
  });



  // Clear PDF state after success/error
  useEffect(() => {
    if (pdfSuccess || pdfError) {
      const timer = setTimeout(() => {
        dispatch(clearPdfState());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [pdfSuccess, pdfError, dispatch]);

  // Fetch profile data when component loads or selected user changes
  useEffect(() => {
    if (mounted && selectedUser) {
      // Refetch if no profile or if the selected user has changed
      if (!profile || profile.userId !== selectedUser.user_id) {
        console.log('🔄 Lab Requisition: Fetching admin profile data for selected user:', selectedUser.user_id);
        dispatch(fetchAdminProfileAction({ userId: selectedUser.user_id }));
      }
    }
  }, [mounted, selectedUser, profile, dispatch]);

  // Add print-specific styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @media print {
        @page { size: letter; margin: 0.25in; }
        body { margin: 0 !important; padding: 0 !important; background: white !important; }
        .MuiContainer-root { max-width: 8in !important; width: 8in !important; margin: 0 auto !important; padding: 0 !important; }
        #lab-requisition-content { padding: 2px !important; background: white !important; width: 100% !important; }
        #lab-requisition-content .pdf-header { display: flex !important; align-items: center !important; justify-content: center !important; margin-bottom: 8px !important; padding: 4px !important; border-bottom: 2px solid #000 !important; }
        #lab-requisition-content .pdf-header img { height: 50px !important; width: auto !important; margin-right: 8px !important; }
        #lab-requisition-content .pdf-header h4 { font-size: 1.8rem !important; color: #877449 !important; font-weight: bold !important; font-family: "Alex Brush", cursive !important; }
        #lab-requisition-content * { 
          line-height: 0.6 !important; 
          margin: 0 !important; 
          background: white !important;
          color: black !important;
        }
        #lab-requisition-content .MuiPaper-root { padding: 2px !important; margin: 0 !important; background: white !important; width: 100% !important; }
        #lab-requisition-content .MuiCard-root { margin-bottom: 2px !important; background: white !important; }
        #lab-requisition-content .MuiCardContent-root { padding: 2px 4px !important; background: white !important; }
        #lab-requisition-content .MuiBox-root { margin-bottom: 2px !important; padding: 2px !important; background: white !important; }
        #lab-requisition-content .MuiTypography-root { margin-bottom: 1px !important; line-height: 0.6 !important; font-size: 0.6rem !important; color: black !important; }
        #lab-requisition-content .MuiFormControlLabel-root { margin: 0px !important; padding: 0 !important; padding-left: 9px !important; line-height: 0.6 !important; color: black !important; }
        #lab-requisition-content .MuiGrid-item { padding: 1px !important; }
        #lab-requisition-content .MuiTextField-root { margin: 0 !important; }
        #lab-requisition-content .MuiFormControlLabel-root .MuiButtonBase-root.MuiCheckbox-root { padding: 0 !important; color: black !important; }
        #lab-requisition-content .MuiSvgIcon-root { color: black !important; }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  const [hematologyTests, setHematologyTests] = useState({
    CBC: false,
    RETIC: false,
    ESR: false,
    'Info Mono': false,
    'CSF/Fluid': false,
    'Hb Electrophonesis': false
  });

  const [coagulationTests, setCoagulationTests] = useState({
    PT: false,
    PTT: false,
    INR: false,
    Fibrinogen: false,
    'Thrombin Time': false,
    'Bleeding Time': false,
    Ristocetin: false,
    FDP: false,
    'Mixing Studies': false,
    'Lupus Anticoagulant': false,
    'Platelet Aggregation': false,
    'Factor Assay XIII': false,
    'Factor Assay IX': false,
    'Factor Assay XI': false
  });

  const [specialTests, setSpecialTests] = useState({
    'HbA2': false,
    "Ham's": false,
    'LAP Score': false,
    'Osmotic Fragility': false,
    'Urine Haemosiderin': false
  });

  const [electrolytesTests, setElectrolytesTests] = useState({
    Na: false,
    K: false,
    Cl: false,
    HCO3: false,
    Urea: false,
    BUN: false,
    Creatinine: false,
    Phosphorus: false,
    Calcium: false,
    'Uric Acid': false,
    Magnesium: false
  });

  const [bloodSugarTests, setBloodSugarTests] = useState({
    'Random Glucose': false,
    'Fasting Glucose': false,
    '2h PPG': false,
    'OGTT': false,
    'HbA1c': false
  });

  const [tumorMarkers, setTumorMarkers] = useState({
    'AFP': false,
    'CEA': false,
    'CA-125': false,
    'CA-15-3': false,
    'Total PSA': false
  });

  const [serumProteinLipids, setSerumProteinLipids] = useState({
    'Total Protein': false,
    'Albumin': false,
    'Globulin': false,
    'Total Cholesterol': false,
    'LDL': false,
    'HDL': false,
    'Triglyceride': false,
    'Protein Electrophoresis': false,
    'Lipoprotein Electrophoresis': false
  });

  const [urineTests, setUrineTests] = useState({
    'Na': false,
    'Urinalysis': false,
    'K': false,
    'Microscopy': false,
    'Urea': false,
    'VMA': false,
    'Creatinine': false,
    'Uric Acid': false,
    'Creatinine Clearance': false,
    'Calcium': false,
    'Phosphorus': false,
    'Protein': false,
    '17-KS': false,
    '17-KGS': false,
    'Protein Electrophoresis': false,
    'Cortisol': false,
    'Microalbumin': false
  });

  const [hormoneTests, setHormoneTests] = useState({
    'FSH': false,
    'TSH': false,
    'FT3': false,
    'DHEA-S': false,
    'FT4': false,
    'Cortisol': false,
    'ACTH': false,
    'Prolactin': false,
    'LH': false,
    'Beta-HCG': false,
    'Oestradiol': false,
    'Progesterone': false,
    'Testosterone': false,
    'Growth Hormone': false
  });

  const [cardiacLiverTests, setCardiacLiverTests] = useState({
    'CPK': false,
    'ALT': false,
    'Bili D': false,
    'Troponin I': false,
    'AST': false,
    'Bili T': false,
    'LDH': false,
    'ALP': false,
    'GGT': false
  });

  const [otherTests, setOtherTests] = useState({
    'Amylase': false,
    'Insulin (F)': false,
    'CSF glucose': false,
    'Vitamin B12/Folic acid': false,
    'Serum Iron/TIBC': false,
    'PTH': false,
    'Ferritin': false,
    'Lithium': false,
    'CSF Protein': false,
    'Beta-Microglubulin': false,
    'Salicylate': false,
    'Lipase': false,
    'Digoxin': false,
    'C-peptide': false,
    'Dilantin': false,
    'Other': false
  });

  const [otherTestText, setOtherTestText] = useState('');

  const [executiveProfileTests, setExecutiveProfileTests] = useState({
    'Executive Profile': false
  });

  const [serologyTests, setSerologyTests] = useState({
    'VDRL': false,
    'FTA': false,
    'Widal': false,
    'ASTO': false,
    'Brucella': false
  });

  const [autoantibodiesTests, setAutoantibodiesTests] = useState({
    'RF': false,
    'ANA': false,
    'ENA': false,
    'Anti-CCP': false,
    'Thyroglobulin': false,
    'ANCA': false,
    'cardiolipin': false,
    'Anti-Beta2GPI': false,
    'Mitochondrial': false,
    'Gastric Parietal Cell': false,
    'dsDNA': false,
    'Smooth Muscle': false
  });

  const [serumProteinConcentrate, setSerumProteinConcentrate] = useState({
    'C3': false,
    'C4': false,
    'CRP': false,
    'IgA': false,
    'IgG': false,
    'IgM': false
  });

  const [lymphocyteEnumeration, setLymphocyteEnumeration] = useState({
    'Viral load': false,
    'CD4': false,
    'CD8': false,
    'T lymphocytes': false,
    'B lymphocytes (CD19/20)': false,
    'NK lymphocytes (CD 38/56)': false
  });

  const [immunologyOtherTests, setImmunologyOtherTests] = useState({
    'H. pylori': false,
    'Other': false
  });

  const [immunologyOtherTestText, setImmunologyOtherTestText] = useState('');




  const [feverRashTests, setFeverRashTests] = useState({
    'Dengue': false,
    'Rubella': false,
    'Measles': false,
    'Varicella': false,
    'Parvovirus': false
  });

  const [hepatitisScreeningTests, setHepatitisScreeningTests] = useState({
    'HBsAg': false,
    'HBeAg': false,
    'Anti-HAV': false,
    'Anti-HCV': false,
    'Anti-HB core': false,
    'Anti-HBsAg': false
  });

  const [vaccineStatusTests, setVaccineStatusTests] = useState({
    'MMR': false,
    'Varicella': false,
    'Anti-HBsAg': false
  });

  const [stiScreeningTests, setStiScreeningTests] = useState({
    'HSV1': false,
    'HSV2': false,
    'Chlamydia': false,
    'HIV': false
  });

  const [virologyOtherTests, setVirologyOtherTests] = useState({
    'CMV': false,
    'EBV': false,
    'TORCH': false,
    'Viral Culture': false,
    'HTLV': false,
    'Western Blot': false,
    'Toxoplasma gondii': false,
    'Stool Rotavirus': false,
    'Mumps': false,
    'Influenza': false,
    'Other': false
  });

  const [virologyOtherTestText, setVirologyOtherTestText] = useState('');

  const [virologyGridTests, setVirologyGridTests] = useState({
    'Chlamydia': {
      'Genotyping': false,
      'Resistance': false,
      'Viral Load': false,
      'PCR': false
    },
    'Dengue Virus': {
      'Genotyping': false,
      'Resistance': false,
      'Viral Load': false,
      'PCR': false
    },
    'HCV': {
      'Genotyping': false,
      'Resistance': false,
      'Viral Load': false,
      'PCR': false
    },
    'HIV': {
      'Genotyping': false,
      'Resistance': false,
      'Viral Load': false,
      'PCR': false
    },
    'Mycobacteria': {
      'Genotyping': false,
      'Resistance': false,
      'Viral Load': false,
      'PCR': false
    }
  });

  const [urgency, setUrgency] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleHematologyTestChange = (testName) => {
    setHematologyTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleCoagulationTestChange = (testName) => {
    setCoagulationTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleSpecialTestChange = (testName) => {
    setSpecialTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleElectrolytesTestChange = (testName) => {
    setElectrolytesTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleBloodSugarTestChange = (testName) => {
    setBloodSugarTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleTumorMarkerChange = (markerName) => {
    setTumorMarkers(prev => ({
      ...prev,
      [markerName]: !prev[markerName]
    }));
  };

  const handleSerumProteinLipidsChange = (testName) => {
    setSerumProteinLipids(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleUrineTestChange = (testName) => {
    setUrineTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleHormoneTestChange = (testName) => {
    setHormoneTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleCardiacLiverTestChange = (testName) => {
    setCardiacLiverTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleOtherTestChange = (testName) => {
    setOtherTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
    
    // Clear the text input when "Other" is unchecked
    if (testName === 'Other') {
      setOtherTestText('');
    }
  };

  const handleExecutiveProfileTestChange = (testName) => {
    setExecutiveProfileTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleSerologyTestChange = (testName) => {
    setSerologyTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleAutoantibodiesTestChange = (testName) => {
    setAutoantibodiesTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleSerumProteinConcentrateChange = (testName) => {
    setSerumProteinConcentrate(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleLymphocyteEnumerationChange = (testName) => {
    setLymphocyteEnumeration(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleImmunologyOtherTestChange = (testName) => {
    setImmunologyOtherTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
    
    // Clear the text input when "Other" is unchecked
    if (testName === 'Other') {
      setImmunologyOtherTestText('');
    }
  };



  const handleFeverRashTestChange = (testName) => {
    setFeverRashTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleHepatitisScreeningTestChange = (testName) => {
    setHepatitisScreeningTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleVaccineStatusTestChange = (testName) => {
    setVaccineStatusTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleStiScreeningTestChange = (testName) => {
    setStiScreeningTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleVirologyOtherTestChange = (testName) => {
    setVirologyOtherTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
    
    // Clear the text input when "Other" is unchecked
    if (testName === 'Other') {
      setVirologyOtherTestText('');
    }
  };

  const handleVirologyGridTestChange = (organism, testType) => {
    setVirologyGridTests(prev => ({
      ...prev,
      [organism]: {
        ...prev[organism],
        [testType]: !prev[organism][testType]
      }
    }));
  };

  const generatePDF = async () => {
    try {
      // Get the form content element
      const element = document.getElementById('lab-requisition-content');
      if (!element) return;

      // Create canvas from HTML content
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Calculate dimensions for letter size
      const imgWidth = 210; // A4 width in mm (close to letter)
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF with compression
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // If content is too tall, scale it down to fit one page while maintaining aspect ratio
      if (imgHeight > pageHeight) {
        const scaleFactor = pageHeight / imgHeight;
        const scaledWidth = imgWidth * scaleFactor;
        const scaledHeight = pageHeight;
        const xOffset = (imgWidth - scaledWidth) / 2;
        
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xOffset, 0, scaledWidth, scaledHeight);
      } else {
        // Content fits on one page
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      }

      // Save the PDF
      pdf.save('lab-requisition.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const sendPDF = () => {
    const patientName = profile?.profile?.name || 'Patient';
    const fileName = `Lab-Requisition-${patientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Create user info object from admin profile
    const userInfo = {
      sub:  profile?.userId ,
      name: profile?.profile?.name ,
      email: profile?.profile?.userEmail,
    };
    
    dispatch({
      type: 'pdf/generateAndSendPdf',
      payload: {
        elementId: 'lab-requisition-content',
        fileName,
        userInfo: userInfo,
      },
    });
  };

  if (isLoading || !mounted || profileLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 1 }}>
            {profileLoading ? 'Loading patient profile...' : 'Loading...'}
          </Typography>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          <Alert severity="error">
            Error loading user: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  // Check if user has access to lab requisition
  if (user && !hasLabAccess) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              Access Denied
            </Typography>
            <Typography variant="body1">
              You do not have permission to access the Lab Requisition page.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Only Admin and Doctor roles can access this page.
            </Typography>
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Access Denied
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            Please log in to access the lab requisition.
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

  return (
    <>
      <Header />
      <Container maxWidth={false} sx={{ 
        mt: 0, 
        mb: 0, 
        pt: 0,
        maxWidth: 'calc(1280px + 100px)', // lg breakpoint + 100px
        width: '100%',
        backgroundColor: 'white',
        '@media print': {
          maxWidth: '8in !important',
          width: '8in !important',
          padding: '0 !important',
          margin: '0 auto !important',
        }
      }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, '@media print': { display: 'none' } }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => window.history.back()}
            sx={{ textTransform: 'none', mr: 2 }}
          >
            Back
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            startIcon={<MedicalServices />}
            onClick={() => {
              // Select weight loss tests by updating React state directly
              
              // Update cardiac/liver tests (ALT, AST, ALP)
              setCardiacLiverTests(prev => ({
                ...prev,
                'ALT': true,
                'AST': true,
                'ALP': true
              }));
              
              // Update electrolytes tests (BUN, Creatinine)
              setElectrolytesTests(prev => ({
                ...prev,
                'BUN': true,
                'Creatinine': true
              }));
              
              // Update blood sugar tests (HbA1c)
              setBloodSugarTests(prev => ({
                ...prev,
                'HbA1c': true
              }));
              
              // Update serum protein/lipids tests (Total Cholesterol, LDL, HDL, Triglyceride)
              setSerumProteinLipids(prev => ({
                ...prev,
                'Total Cholesterol': true,
                'LDL': true,
                'HDL': true,
                'Triglyceride': true
              }));
            }}
            sx={{ textTransform: 'none', mr: 1, borderColor: '#877449', color: '#877449', '&:hover': { borderColor: '#B8941F', backgroundColor: 'rgba(135, 116, 73, 0.04)' } }}
          >
            Weight Loss Tests
          </Button>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={generatePDF}
            sx={{ textTransform: 'none', mr: 1, backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
          >
            PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={sendPDF}
            disabled={isGenerating || isSending}
            sx={{ textTransform: 'none', mr: 1, backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
          >
            {isGenerating || isSending ? <CircularProgress size={20} color="inherit" /> : 'Send'}
          </Button>
        </Box>

        {/* Main Content - Patient Information in Own Row */}
        <div id="lab-requisition-content">
        
        {/* PDF Header */}
        <Box className="pdf-header" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          mb: 2,
          p: 1,
          borderBottom: '2px solid #000',
          '@media print': {
            display: 'flex !important'
          }
        }}>
          <Box component="img" 
            src="/images/Lukaria_logo_background_removed_small.webp" 
            alt="LuKaria Logo"
            sx={{ 
              height: 60, 
              width: 'auto',
              mr: 2,
              '@media print': {
                height: '50px !important'
              }
            }} 
          />
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold',
            color: '#877449',
            fontFamily: '"Alex Brush", cursive',
            '@media print': {
              fontSize: '1.8rem !important',
              color: '#877449 !important'
            }
          }}>
            Svelte <span style={{ 
              fontFamily: 'sans-serif', 
              fontSize: '0.6em', 
              verticalAlign: 'sub',
              fontWeight: 'normal'
            }}>by LuKaria</span>
          </Typography>
        </Box>
        
        {/* Success/Error Alerts */}
        {pdfSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            PDF sent successfully! Check your email and SharePoint for the document.
          </Alert>
        )}
        {pdfError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error sending PDF: {pdfError}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ 
          p: 0.5, 
          backgroundColor: 'white',
          lineHeight: 0.8, 
          '& *': { lineHeight: 0.8, color: 'black' }, 
          '& .MuiInputBase-input': { fontSize: '0.875rem' }, 
          '& .MuiFormControlLabel-root': { fontSize: '0.75rem', lineHeight: 0.84, my: '1px', p: 0, pl: '9px' }, 
          '& .MuiFormControlLabel-root .MuiFormControlLabel-label': { fontSize: '0.75rem', lineHeight: 0.84 }, 
          '& .MuiFormControlLabel-root .MuiTypography-root': { fontSize: '0.75rem', lineHeight: 0.84 }, 
          '& .MuiFormControlLabel-root .MuiButtonBase-root.MuiCheckbox-root': { p: 0 },
          '& .MuiTypography-root': { lineHeight: 0.8 },
          '@media print': {
            p: '2px',
            background: 'white !important',
            '& *': { 
              lineHeight: '0.6 !important', 
              fontSize: '0.6rem !important',
              background: 'white !important',
              color: 'black !important'
            },
            '& .MuiCard-root': { mb: '2px !important', background: 'white !important' },
            '& .MuiCardContent-root': { p: '2px 4px !important', background: 'white !important' },
            '& .MuiBox-root': { mb: '2px !important', p: '2px !important', background: 'white !important' },
            '& .MuiFormControlLabel-root': { my: '0px !important', p: '0 !important', pl: '9px !important', color: 'black !important' },
            '& .MuiFormControlLabel-root .MuiButtonBase-root.MuiCheckbox-root': { p: '0 !important' },
            '& .MuiTypography-root': { color: 'black !important' },
            '& .MuiSvgIcon-root': { color: 'black !important' },
          }
        }}>
          {/* Patient Information - Full Width Row */}
          <Card variant="outlined" sx={{ mb: 0.625, backgroundColor: 'white' }}>
            <CardContent sx={{ py: 0.5, px: 1.5 }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    label="Patient Name"
                    value={profile?.profile?.name || ''}
                    variant="standard"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    value={profile?.profile?.dateOfBirth || ''}
                    variant="standard"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    label="Sex"
                    value={profile?.profile?.sex || ''}
                    variant="standard"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2.4}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profile?.profile?.preferredPhone || ''}
                    variant="standard"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={12} md={2.4}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={profile?.profile?.homeAddress || ''}
                    multiline
                    rows={2}
                    variant="standard"
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Rest of Content - 2 Column Layout */}
          <Grid container spacing={1}>

            {/* Column 1 - Section A: Requesting Physician */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 0.625, backgroundColor: 'white' }}>
                <CardContent sx={{ py: 0.5, px: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                    A. Requesting Physician
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Doctor's Name"
                        variant="standard"
                        defaultValue="Dr. Kadria Fairclough"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Telephone Number"
                        variant="standard"
                        defaultValue="18762903659"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Fax Number"
                        variant="standard"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Registration Number"
                        variant="standard"
                        defaultValue="84608"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        variant="standard"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        variant="standard"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Signature
                    </Typography>
                    <Box
                      sx={{
                        border: '1px dashed #ccc',
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9f9f9'
                      }}
                    >
                      <Image
                        src="/images/signature.webp"
                        alt="Doctor's Signature"
                        width={120}
                        height={40}
                        style={{
                          objectFit: 'contain',
                          maxHeight: '40px'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Column 2 - Section B: Copy results to: */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ mb: 0.625, backgroundColor: 'white' }}>
                <CardContent sx={{ py: 0.5, px: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                    B. Copy results to:
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Doctor's Name"
                        variant="standard"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Telephone Number"
                        variant="standard"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Fax Number"
                        variant="standard"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Registration Number"
                        variant="standard"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        multiline
                        rows={2}
                        variant="standard"
                      />
                    </Grid>
                    </Grid>
                </CardContent>
              </Card>
              
              {/* Email Results Card */}
              <Card variant="outlined" sx={{ mb: 0.625, backgroundColor: 'white' }}>
                <CardContent sx={{ py: 0.5, px: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.625, color: 'black', textAlign: 'center' }}>
                    SEND ALL RESULTS TO EMAIL: kadriaf@lukariagroup.com
                    </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Lab Tests Section */}
          <Box sx={{ mt: 0.625 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
              Laboratory Tests Requested
            </Typography>
            <Paper variant="outlined" sx={{ mt: 0.625, p: 1.5, backgroundColor: 'white' }}>
              {/* Hematology Section */}
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'black', fontSize: '1rem' }}>
                Hematology
              </Typography>
                  <Grid container spacing={1}>
                    {/* Left Column - Routine Tests (30%) */}
                    <Grid item xs={12} md={3.6}>
                      {/* Routine Tests */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Routine
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="CBC"
                                    checked={hematologyTests.CBC}
                                    onChange={() => handleHematologyTestChange('CBC')}
                                    color="primary"
                                  />
                                }
                                label="CBC"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="RETIC"
                                    checked={hematologyTests.RETIC}
                                    onChange={() => handleHematologyTestChange('RETIC')}
                                    color="primary"
                                  />
                                }
                                label="RETIC"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="ESR"
                                    checked={hematologyTests.ESR}
                                    onChange={() => handleHematologyTestChange('ESR')}
                                    color="primary"
                                  />
                                }
                                label="ESR"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Info Mono"
                                    checked={hematologyTests['Info Mono']}
                                    onChange={() => handleHematologyTestChange('Info Mono')}
                                    color="primary"
                                  />
                                }
                                label="Info Mono"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="CSF/Fluid"
                                    checked={hematologyTests['CSF/Fluid']}
                                    onChange={() => handleHematologyTestChange('CSF/Fluid')}
                                    color="primary"
                                  />
                                }
                                label="CSF/Fluid"
                              />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Hb Electrophonesis"
                                    checked={hematologyTests['Hb Electrophonesis']}
                                    onChange={() => handleHematologyTestChange('Hb Electrophonesis')}
                                    color="primary"
                                  />
                                }
                                label="Hb Electrophonesis"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>

                    </Grid>

                    {/* Right Column - Coagulation Tests (70%) */}
                    <Grid item xs={12} md={8.4}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Coagulation Tests
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="PT"
                                    checked={coagulationTests.PT}
                                    onChange={() => handleCoagulationTestChange('PT')}
                                    color="primary"
                                  />
                                }
                                label="PT"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="PTT"
                                    checked={coagulationTests.PTT}
                                    onChange={() => handleCoagulationTestChange('PTT')}
                                    color="primary"
                                  />
                                }
                                label="PTT"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="INR"
                                    checked={coagulationTests.INR}
                                    onChange={() => handleCoagulationTestChange('INR')}
                                    color="primary"
                                  />
                                }
                                label="INR"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Fibrinogen"
                                    checked={coagulationTests.Fibrinogen}
                                    onChange={() => handleCoagulationTestChange('Fibrinogen')}
                                    color="primary"
                                  />
                                }
                                label="Fibrinogen"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Thrombin Time"
                                    checked={coagulationTests['Thrombin Time']}
                                    onChange={() => handleCoagulationTestChange('Thrombin Time')}
                                    color="primary"
                                  />
                                }
                                label="Thrombin Time"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Bleeding Time"
                                    checked={coagulationTests['Bleeding Time']}
                                    onChange={() => handleCoagulationTestChange('Bleeding Time')}
                                    color="primary"
                                  />
                                }
                                label="Bleeding Time"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Ristocetin"
                                    checked={coagulationTests.Ristocetin}
                                    onChange={() => handleCoagulationTestChange('Ristocetin')}
                                    color="primary"
                                  />
                                }
                                label="Ristocetin"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="FDP"
                                    checked={coagulationTests.FDP}
                                    onChange={() => handleCoagulationTestChange('FDP')}
                                    color="primary"
                                  />
                                }
                                label="FDP"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Mixing Studies"
                                    checked={coagulationTests['Mixing Studies']}
                                    onChange={() => handleCoagulationTestChange('Mixing Studies')}
                                    color="primary"
                                  />
                                }
                                label="Mixing Studies"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Lupus Anticoagulant"
                                    checked={coagulationTests['Lupus Anticoagulant']}
                                    onChange={() => handleCoagulationTestChange('Lupus Anticoagulant')}
                                    color="primary"
                                  />
                                }
                                label="Lupus Anticoagulant"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Platelet Aggregation"
                                    checked={coagulationTests['Platelet Aggregation']}
                                    onChange={() => handleCoagulationTestChange('Platelet Aggregation')}
                                    color="primary"
                                  />
                                }
                                label="Platelet Aggregation"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Factor Assay XIII"
                                    checked={coagulationTests['Factor Assay XIII']}
                                    onChange={() => handleCoagulationTestChange('Factor Assay XIII')}
                                    color="primary"
                                  />
                                }
                                label="Factor Assay XIII"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Factor Assay IX"
                                    checked={coagulationTests['Factor Assay IX']}
                                    onChange={() => handleCoagulationTestChange('Factor Assay IX')}
                                    color="primary"
                                  />
                                }
                                label="Factor Assay IX"
                              />
                            </Grid>
                            <Grid item xs={12} sm={12/7}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Factor Assay XI"
                                    checked={coagulationTests['Factor Assay XI']}
                                    onChange={() => handleCoagulationTestChange('Factor Assay XI')}
                                    color="primary"
                                  />
                                }
                                label="Factor Assay XI"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>
            </Paper>
          </Box>

          {/* Clinical Chemistry */}
          <Box sx={{ mt: 2 }}>
            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'black', fontSize: '1rem' }}>
                Clinical Chemistry
              </Typography>
                  {/* Electrolytes and Blood Sugar - Two Column Layout */}
                  <Grid container spacing={3}>
                    {/* Left Column - Electrolytes and Renal Function Tests */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Electrolytes and Renal Function Tests
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Na"
                              checked={electrolytesTests.Na}
                              onChange={() => handleElectrolytesTestChange('Na')}
                              color="primary"
                            />
                            }
                            label="Na"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="K"
                              checked={electrolytesTests.K}
                              onChange={() => handleElectrolytesTestChange('K')}
                              color="primary"
                            />
                            }
                            label="K"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Cl"
                              checked={electrolytesTests.Cl}
                              onChange={() => handleElectrolytesTestChange('Cl')}
                              color="primary"
                            />
                            }
                            label="Cl"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="HCO3"
                              checked={electrolytesTests.HCO3}
                              onChange={() => handleElectrolytesTestChange('HCO3')}
                              color="primary"
                            />
                            }
                            label="HCO3"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Urea"
                              checked={electrolytesTests.Urea}
                              onChange={() => handleElectrolytesTestChange('Urea')}
                              color="primary"
                            />
                            }
                            label="Urea"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="BUN"
                              checked={electrolytesTests.BUN}
                              onChange={() => handleElectrolytesTestChange('BUN')}
                              color="primary"
                            />
                            }
                            label="BUN"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Creatinine"
                              checked={electrolytesTests.Creatinine}
                              onChange={() => handleElectrolytesTestChange('Creatinine')}
                              color="primary"
                            />
                            }
                            label="Creatinine"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Phosphorus"
                              checked={electrolytesTests.Phosphorus}
                              onChange={() => handleElectrolytesTestChange('Phosphorus')}
                              color="primary"
                            />
                            }
                            label="Phosphorus"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Calcium"
                              checked={electrolytesTests.Calcium}
                              onChange={() => handleElectrolytesTestChange('Calcium')}
                              color="primary"
                            />
                            }
                            label="Calcium"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                            <Checkbox
                              name="Uric Acid"
                              checked={electrolytesTests['Uric Acid']}
                              onChange={() => handleElectrolytesTestChange('Uric Acid')}
                              color="primary"
                            />
                            }
                            label="Uric Acid"
                          />
                        </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                <Checkbox
                                  name="Magnesium"
                                  checked={electrolytesTests.Magnesium}
                                  onChange={() => handleElectrolytesTestChange('Magnesium')}
                                  color="primary"
                                />
                                }
                                label="Magnesium"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>

                    {/* Right Column - Blood Sugar */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Blood Sugar
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Random Glucose"
                                    checked={bloodSugarTests['Random Glucose']}
                                    onChange={() => handleBloodSugarTestChange('Random Glucose')}
                                    color="primary"
                                  />
                                }
                                label="Random Glucose"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Fasting Glucose"
                                    checked={bloodSugarTests['Fasting Glucose']}
                                    onChange={() => handleBloodSugarTestChange('Fasting Glucose')}
                                    color="primary"
                                  />
                                }
                                label="Fasting Glucose"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={bloodSugarTests['2h PPG']}
                                    onChange={() => handleBloodSugarTestChange('2h PPG')}
                                    color="primary"
                                  />
                                }
                                label="2h PPG"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="OGTT"
                                    checked={bloodSugarTests['OGTT']}
                                    onChange={() => handleBloodSugarTestChange('OGTT')}
                                    color="primary"
                                  />
                                }
                                label="OGTT"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="HbA1c"
                                    checked={bloodSugarTests['HbA1c']}
                                    onChange={() => handleBloodSugarTestChange('HbA1c')}
                                    color="primary"
                                  />
                                }
                                label="HbA1c"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>

                      {/* Tumor Markers - Under Blood Sugar */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Tumor Markers
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="AFP"
                                    checked={tumorMarkers['AFP']}
                                    onChange={() => handleTumorMarkerChange('AFP')}
                                    color="primary"
                                  />
                                }
                                label="AFP"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="CEA"
                                    checked={tumorMarkers['CEA']}
                                    onChange={() => handleTumorMarkerChange('CEA')}
                                    color="primary"
                                  />
                                }
                                label="CEA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="CA-125"
                                    checked={tumorMarkers['CA-125']}
                                    onChange={() => handleTumorMarkerChange('CA-125')}
                                    color="primary"
                                  />
                                }
                                label="CA-125"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="CA-15-3"
                                    checked={tumorMarkers['CA-15-3']}
                                    onChange={() => handleTumorMarkerChange('CA-15-3')}
                                    color="primary"
                                  />
                                }
                                label="CA-15-3"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Total PSA"
                                    checked={tumorMarkers['Total PSA']}
                                    onChange={() => handleTumorMarkerChange('Total PSA')}
                                    color="primary"
                                  />
                                }
                                label="Total PSA"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>


                  {/* Serum Protein and Lipids and Urine - Two Column Layout */}
                  <Grid container spacing={3}>
                    {/* Left Column - Serum Protein and Lipids */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Serum Protein and Lipids
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Total Protein"
                                    checked={serumProteinLipids['Total Protein']}
                                    onChange={() => handleSerumProteinLipidsChange('Total Protein')}
                                    color="primary"
                                  />
                                }
                                label="Total Protein"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Albumin"
                                    checked={serumProteinLipids['Albumin']}
                                    onChange={() => handleSerumProteinLipidsChange('Albumin')}
                                    color="primary"
                                  />
                                }
                                label="Albumin"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Globulin"
                                    checked={serumProteinLipids['Globulin']}
                                    onChange={() => handleSerumProteinLipidsChange('Globulin')}
                                    color="primary"
                                  />
                                }
                                label="Globulin"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Total Cholesterol"
                                    checked={serumProteinLipids['Total Cholesterol']}
                                    onChange={() => handleSerumProteinLipidsChange('Total Cholesterol')}
                                    color="primary"
                                  />
                                }
                                label="Total Cholesterol"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="LDL"
                                    checked={serumProteinLipids['LDL']}
                                    onChange={() => handleSerumProteinLipidsChange('LDL')}
                                    color="primary"
                                  />
                                }
                                label="LDL"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="HDL"
                                    checked={serumProteinLipids['HDL']}
                                    onChange={() => handleSerumProteinLipidsChange('HDL')}
                                    color="primary"
                                  />
                                }
                                label="HDL"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Triglyceride"
                                    checked={serumProteinLipids['Triglyceride']}
                                    onChange={() => handleSerumProteinLipidsChange('Triglyceride')}
                                    color="primary"
                                  />
                                }
                                label="Triglyceride"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Protein Electrophoresis"
                                    checked={serumProteinLipids['Protein Electrophoresis']}
                                    onChange={() => handleSerumProteinLipidsChange('Protein Electrophoresis')}
                                    color="primary"
                                  />
                                }
                                label="Protein Electrophoresis"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Lipoprotein Electrophoresis"
                                    checked={serumProteinLipids['Lipoprotein Electrophoresis']}
                                    onChange={() => handleSerumProteinLipidsChange('Lipoprotein Electrophoresis')}
                                    color="primary"
                                  />
                                }
                                label="Lipoprotein Electrophoresis"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>

                      {/* Hormones - Under Serum Protein and Lipids */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Hormones
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['FSH']}
                                    onChange={() => handleHormoneTestChange('FSH')}
                                    color="primary"
                                  />
                                }
                                label="FSH"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['TSH']}
                                    onChange={() => handleHormoneTestChange('TSH')}
                                    color="primary"
                                  />
                                }
                                label="TSH"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['FT3']}
                                    onChange={() => handleHormoneTestChange('FT3')}
                                    color="primary"
                                  />
                                }
                                label="FT3"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['DHEA-S']}
                                    onChange={() => handleHormoneTestChange('DHEA-S')}
                                    color="primary"
                                  />
                                }
                                label="DHEA-S"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['FT4']}
                                    onChange={() => handleHormoneTestChange('FT4')}
                                    color="primary"
                                  />
                                }
                                label="FT4"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Cortisol']}
                                    onChange={() => handleHormoneTestChange('Cortisol')}
                                    color="primary"
                                  />
                                }
                                label="Cortisol"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['ACTH']}
                                    onChange={() => handleHormoneTestChange('ACTH')}
                                    color="primary"
                                  />
                                }
                                label="ACTH"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Prolactin']}
                                    onChange={() => handleHormoneTestChange('Prolactin')}
                                    color="primary"
                                  />
                                }
                                label="Prolactin"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['LH']}
                                    onChange={() => handleHormoneTestChange('LH')}
                                    color="primary"
                                  />
                                }
                                label="LH"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Beta-HCG']}
                                    onChange={() => handleHormoneTestChange('Beta-HCG')}
                                    color="primary"
                                  />
                                }
                                label="Beta-HCG"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Oestradiol']}
                                    onChange={() => handleHormoneTestChange('Oestradiol')}
                                    color="primary"
                                  />
                                }
                                label="Oestradiol"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Progesterone']}
                                    onChange={() => handleHormoneTestChange('Progesterone')}
                                    color="primary"
                                  />
                                }
                                label="Progesterone"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Testosterone']}
                                    onChange={() => handleHormoneTestChange('Testosterone')}
                                    color="primary"
                                  />
                                }
                                label="Testosterone"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hormoneTests['Growth Hormone']}
                                    onChange={() => handleHormoneTestChange('Growth Hormone')}
                                    color="primary"
                                  />
                                }
                                label="Growth Hormone"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>

                    {/* Right Column - Urine */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Urine
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Na']}
                                    onChange={() => handleUrineTestChange('Na')}
                                    color="primary"
                                  />
                                }
                                label="Na"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Urinalysis']}
                                    onChange={() => handleUrineTestChange('Urinalysis')}
                                    color="primary"
                                  />
                                }
                                label="Urinalysis"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['K']}
                                    onChange={() => handleUrineTestChange('K')}
                                    color="primary"
                                  />
                                }
                                label="K"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Microscopy']}
                                    onChange={() => handleUrineTestChange('Microscopy')}
                                    color="primary"
                                  />
                                }
                                label="Microscopy"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Urea']}
                                    onChange={() => handleUrineTestChange('Urea')}
                                    color="primary"
                                  />
                                }
                                label="Urea"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['VMA']}
                                    onChange={() => handleUrineTestChange('VMA')}
                                    color="primary"
                                  />
                                }
                                label="VMA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Creatinine']}
                                    onChange={() => handleUrineTestChange('Creatinine')}
                                    color="primary"
                                  />
                                }
                                label="Creatinine"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Uric Acid']}
                                    onChange={() => handleUrineTestChange('Uric Acid')}
                                    color="primary"
                                  />
                                }
                                label="Uric Acid"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Creatinine Clearance']}
                                    onChange={() => handleUrineTestChange('Creatinine Clearance')}
                                    color="primary"
                                  />
                                }
                                label="Creatinine Clearance"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Calcium']}
                                    onChange={() => handleUrineTestChange('Calcium')}
                                    color="primary"
                                  />
                                }
                                label="Calcium"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Phosphorus']}
                                    onChange={() => handleUrineTestChange('Phosphorus')}
                                    color="primary"
                                  />
                                }
                                label="Phosphorus"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Protein']}
                                    onChange={() => handleUrineTestChange('Protein')}
                                    color="primary"
                                  />
                                }
                                label="Protein"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['17-KS']}
                                    onChange={() => handleUrineTestChange('17-KS')}
                                    color="primary"
                                  />
                                }
                                label="17-KS"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['17-KGS']}
                                    onChange={() => handleUrineTestChange('17-KGS')}
                                    color="primary"
                                  />
                                }
                                label="17-KGS"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Protein Electrophoresis']}
                                    onChange={() => handleUrineTestChange('Protein Electrophoresis')}
                                    color="primary"
                                  />
                                }
                                label="Protein Electrophoresis"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Cortisol']}
                                    onChange={() => handleUrineTestChange('Cortisol')}
                                    color="primary"
                                  />
                                }
                                label="Cortisol"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={urineTests['Microalbumin']}
                                    onChange={() => handleUrineTestChange('Microalbumin')}
                                    color="primary"
                                  />
                                }
                                label="Microalbumin"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>

                      {/* Cardiac and Liver Function Test - Under Urine */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Cardiac and Liver Function Test
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="CPK"
                                    checked={cardiacLiverTests['CPK']}
                                    onChange={() => handleCardiacLiverTestChange('CPK')}
                                    color="primary"
                                  />
                                }
                                label="CPK"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="ALT"
                                    checked={cardiacLiverTests['ALT']}
                                    onChange={() => handleCardiacLiverTestChange('ALT')}
                                    color="primary"
                                  />
                                }
                                label="ALT"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Bili D"
                                    checked={cardiacLiverTests['Bili D']}
                                    onChange={() => handleCardiacLiverTestChange('Bili D')}
                                    color="primary"
                                  />
                                }
                                label="Bili D"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Troponin I"
                                    checked={cardiacLiverTests['Troponin I']}
                                    onChange={() => handleCardiacLiverTestChange('Troponin I')}
                                    color="primary"
                                  />
                                }
                                label="Troponin I"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="AST"
                                    checked={cardiacLiverTests['AST']}
                                    onChange={() => handleCardiacLiverTestChange('AST')}
                                    color="primary"
                                  />
                                }
                                label="AST"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="Bili T"
                                    checked={cardiacLiverTests['Bili T']}
                                    onChange={() => handleCardiacLiverTestChange('Bili T')}
                                    color="primary"
                                  />
                                }
                                label="Bili T"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="LDH"
                                    checked={cardiacLiverTests['LDH']}
                                    onChange={() => handleCardiacLiverTestChange('LDH')}
                                    color="primary"
                                  />
                                }
                                label="LDH"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="ALP"
                                    checked={cardiacLiverTests['ALP']}
                                    onChange={() => handleCardiacLiverTestChange('ALP')}
                                    color="primary"
                                  />
                                }
                                label="ALP"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={12/5}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    name="GGT"
                                    checked={cardiacLiverTests['GGT']}
                                    onChange={() => handleCardiacLiverTestChange('GGT')}
                                    color="primary"
                                  />
                                }
                                label="GGT"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>




                  {/* Other Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 0.625 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'black' }}>
                      Other
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Amylase']}
                                onChange={() => handleOtherTestChange('Amylase')}
                                color="primary"
                              />
                            }
                            label="Amylase"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Insulin (F)']}
                                onChange={() => handleOtherTestChange('Insulin (F)')}
                                color="primary"
                              />
                            }
                            label="Insulin (F)"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['CSF glucose']}
                                onChange={() => handleOtherTestChange('CSF glucose')}
                                color="primary"
                              />
                            }
                            label="CSF glucose"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Vitamin B12/Folic acid']}
                                onChange={() => handleOtherTestChange('Vitamin B12/Folic acid')}
                                color="primary"
                              />
                            }
                            label="Vitamin B12/Folic acid"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Serum Iron/TIBC']}
                                onChange={() => handleOtherTestChange('Serum Iron/TIBC')}
                                color="primary"
                              />
                            }
                            label="Serum Iron/TIBC"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['PTH']}
                                onChange={() => handleOtherTestChange('PTH')}
                                color="primary"
                              />
                            }
                            label="PTH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Ferritin']}
                                onChange={() => handleOtherTestChange('Ferritin')}
                                color="primary"
                              />
                            }
                            label="Ferritin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Lithium']}
                                onChange={() => handleOtherTestChange('Lithium')}
                                color="primary"
                              />
                            }
                            label="Lithium"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['CSF Protein']}
                                onChange={() => handleOtherTestChange('CSF Protein')}
                                color="primary"
                              />
                            }
                            label="CSF Protein"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Beta-Microglubulin']}
                                onChange={() => handleOtherTestChange('Beta-Microglubulin')}
                                color="primary"
                              />
                            }
                            label="Beta-Microglubulin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Salicylate']}
                                onChange={() => handleOtherTestChange('Salicylate')}
                                color="primary"
                              />
                            }
                            label="Salicylate"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Lipase']}
                                onChange={() => handleOtherTestChange('Lipase')}
                                color="primary"
                              />
                            }
                            label="Lipase"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Digoxin']}
                                onChange={() => handleOtherTestChange('Digoxin')}
                                color="primary"
                              />
                            }
                            label="Digoxin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['C-peptide']}
                                onChange={() => handleOtherTestChange('C-peptide')}
                                color="primary"
                              />
                            }
                            label="C-peptide"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Dilantin']}
                                onChange={() => handleOtherTestChange('Dilantin')}
                                color="primary"
                              />
                            }
                            label="Dilantin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1.5}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={otherTests['Other']}
                                onChange={() => handleOtherTestChange('Other')}
                                color="primary"
                              />
                            }
                            label="Other"
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Other Test Text Input */}
                      {otherTests['Other'] && (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            label="Specify other test"
                            placeholder="Enter the name of the other test..."
                            value={otherTestText}
                            onChange={(e) => setOtherTestText(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: 400 }}
                          />
                        </Box>
                      )}
                    </FormGroup>
                  </Box>
            </Paper>
          </Box>

          {/* Immunology */}
          <Box sx={{ mt: 2 }}>
            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'black', fontSize: '1rem' }}>
                IMMUNOLOGY
              </Typography>
                  {/* Serology and Autoantibodies - Two Column Layout */}
                  <Grid container spacing={3}>
                    {/* Left Column - Serology and Serum Protein Concentrate */}
                    <Grid item xs={12} md={6}>
                      {/* Serology */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Serology
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serologyTests['VDRL']}
                                    onChange={() => handleSerologyTestChange('VDRL')}
                                    color="primary"
                                  />
                                }
                                label="VDRL"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serologyTests['FTA']}
                                    onChange={() => handleSerologyTestChange('FTA')}
                                    color="primary"
                                  />
                                }
                                label="FTA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serologyTests['Widal']}
                                    onChange={() => handleSerologyTestChange('Widal')}
                                    color="primary"
                                  />
                                }
                                label="Widal"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serologyTests['ASTO']}
                                    onChange={() => handleSerologyTestChange('ASTO')}
                                    color="primary"
                                  />
                                }
                                label="ASTO"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serologyTests['Brucella']}
                                    onChange={() => handleSerologyTestChange('Brucella')}
                                    color="primary"
                                  />
                                }
                                label="Brucella"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>

                      {/* Serum Protein Concentrate */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Serum Protein Concentrate
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serumProteinConcentrate['C3']}
                                    onChange={() => handleSerumProteinConcentrateChange('C3')}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography component="span">
                                    C<sub>3</sub>
                                  </Typography>
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serumProteinConcentrate['C4']}
                                    onChange={() => handleSerumProteinConcentrateChange('C4')}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography component="span">
                                    C<sub>4</sub>
                                  </Typography>
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serumProteinConcentrate['CRP']}
                                    onChange={() => handleSerumProteinConcentrateChange('CRP')}
                                    color="primary"
                                  />
                                }
                                label="CRP"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serumProteinConcentrate['IgA']}
                                    onChange={() => handleSerumProteinConcentrateChange('IgA')}
                                    color="primary"
                                  />
                                }
                                label="IgA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serumProteinConcentrate['IgG']}
                                    onChange={() => handleSerumProteinConcentrateChange('IgG')}
                                    color="primary"
                                  />
                                }
                                label="IgG"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={serumProteinConcentrate['IgM']}
                                    onChange={() => handleSerumProteinConcentrateChange('IgM')}
                                    color="primary"
                                  />
                                }
                                label="IgM"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>

                    {/* Right Column - Autoantibodies */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Autoantibodies
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['RF']}
                                    onChange={() => handleAutoantibodiesTestChange('RF')}
                                    color="primary"
                                  />
                                }
                                label="RF"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['ANA']}
                                    onChange={() => handleAutoantibodiesTestChange('ANA')}
                                    color="primary"
                                  />
                                }
                                label="ANA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['ENA']}
                                    onChange={() => handleAutoantibodiesTestChange('ENA')}
                                    color="primary"
                                  />
                                }
                                label="ENA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['Anti-CCP']}
                                    onChange={() => handleAutoantibodiesTestChange('Anti-CCP')}
                                    color="primary"
                                  />
                                }
                                label="Anti-CCP"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['Thyroglobulin']}
                                    onChange={() => handleAutoantibodiesTestChange('Thyroglobulin')}
                                    color="primary"
                                  />
                                }
                                label="Thyroglobulin"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['ANCA']}
                                    onChange={() => handleAutoantibodiesTestChange('ANCA')}
                                    color="primary"
                                  />
                                }
                                label="ANCA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['cardiolipin']}
                                    onChange={() => handleAutoantibodiesTestChange('cardiolipin')}
                                    color="primary"
                                  />
                                }
                                label="cardiolipin"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['Anti-Beta2GPI']}
                                    onChange={() => handleAutoantibodiesTestChange('Anti-Beta2GPI')}
                                    color="primary"
                                  />
                                }
                                label="Anti-Beta2GPI"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['Mitochondrial']}
                                    onChange={() => handleAutoantibodiesTestChange('Mitochondrial')}
                                    color="primary"
                                  />
                                }
                                label="Mitochondrial"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['Gastric Parietal Cell']}
                                    onChange={() => handleAutoantibodiesTestChange('Gastric Parietal Cell')}
                                    color="primary"
                                  />
                                }
                                label="Gastric Parietal Cell"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['dsDNA']}
                                    onChange={() => handleAutoantibodiesTestChange('dsDNA')}
                                    color="primary"
                                  />
                                }
                                label="dsDNA"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={autoantibodiesTests['Smooth Muscle']}
                                    onChange={() => handleAutoantibodiesTestChange('Smooth Muscle')}
                                    color="primary"
                                  />
                                }
                                label="Smooth Muscle"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>



                  {/* Lymphocyte Enumeration and Other Tests - Two Column Layout */}
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={1}>
                    {/* Left Column - Lymphocyte Enumeration (75%) */}
                    <Grid item xs={12} md={9}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Lymphocyte Enumeration
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={lymphocyteEnumeration['Viral load']}
                                    onChange={() => handleLymphocyteEnumerationChange('Viral load')}
                                    color="primary"
                                  />
                                }
                                label="Viral load"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={lymphocyteEnumeration['CD4']}
                                    onChange={() => handleLymphocyteEnumerationChange('CD4')}
                                    color="primary"
                                  />
                                }
                                label="CD4"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={lymphocyteEnumeration['CD8']}
                                    onChange={() => handleLymphocyteEnumerationChange('CD8')}
                                    color="primary"
                                  />
                                }
                                label="CD8"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={lymphocyteEnumeration['T lymphocytes']}
                                    onChange={() => handleLymphocyteEnumerationChange('T lymphocytes')}
                                    color="primary"
                                  />
                                }
                                label="T lymphocytes"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={lymphocyteEnumeration['B lymphocytes (CD19/20)']}
                                    onChange={() => handleLymphocyteEnumerationChange('B lymphocytes (CD19/20)')}
                                    color="primary"
                                  />
                                }
                                label="B lymphocytes (CD19/20)"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={lymphocyteEnumeration['NK lymphocytes (CD 38/56)']}
                                    onChange={() => handleLymphocyteEnumerationChange('NK lymphocytes (CD 38/56)')}
                                    color="primary"
                                  />
                                }
                                label="NK lymphocytes (CD 38/56)"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>

                    {/* Right Column - Other Tests (25%) */}
                    <Grid item xs={12} md={3}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Other Tests
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={immunologyOtherTests['H. pylori']}
                                    onChange={() => handleImmunologyOtherTestChange('H. pylori')}
                                    color="primary"
                                  />
                                }
                                label="H. pylori"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={6}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={immunologyOtherTests['Other']}
                                    onChange={() => handleImmunologyOtherTestChange('Other')}
                                    color="primary"
                                  />
                                }
                                label="Other"
                              />
                            </Grid>
                          </Grid>
                          
                          {/* Other Test Text Input */}
                          {immunologyOtherTests['Other'] && (
                            <Box sx={{ mt: 1 }}>
                              <TextField
                                fullWidth
                                label="Specify other immunology test"
                                placeholder="Enter the name of the other test..."
                                value={immunologyOtherTestText}
                                onChange={(e) => setImmunologyOtherTestText(e.target.value)}
                                variant="outlined"
                                size="small"
                                sx={{ maxWidth: 400 }}
                              />
                            </Box>
                          )}
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>
            </Paper>
          </Box>


          {/* Virology */}
          <Box sx={{ mt: 2 }}>
            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'black', fontSize: '1rem' }}>
                Virology
              </Typography>
                  {/* Fever and Rash and Hepatitis Screening - Two Column Layout */}
                  <Grid container spacing={3}>
                    {/* Left Column - Fever and Rash */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Fever and Rash
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={feverRashTests['Dengue']}
                                    onChange={() => handleFeverRashTestChange('Dengue')}
                                    color="primary"
                                  />
                                }
                                label="Dengue"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={feverRashTests['Rubella']}
                                    onChange={() => handleFeverRashTestChange('Rubella')}
                                    color="primary"
                                  />
                                }
                                label="Rubella"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={feverRashTests['Measles']}
                                    onChange={() => handleFeverRashTestChange('Measles')}
                                    color="primary"
                                  />
                                }
                                label="Measles"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={feverRashTests['Varicella']}
                                    onChange={() => handleFeverRashTestChange('Varicella')}
                                    color="primary"
                                  />
                                }
                                label="Varicella"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2.4}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={feverRashTests['Parvovirus']}
                                    onChange={() => handleFeverRashTestChange('Parvovirus')}
                                    color="primary"
                                  />
                                }
                                label="Parvovirus"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>

                    {/* Right Column - Hepatitis Screening */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
                          Hepatitis Screening
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hepatitisScreeningTests['HBsAg']}
                                    onChange={() => handleHepatitisScreeningTestChange('HBsAg')}
                                    color="primary"
                                  />
                                }
                                label="HBsAg"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hepatitisScreeningTests['HBeAg']}
                                    onChange={() => handleHepatitisScreeningTestChange('HBeAg')}
                                    color="primary"
                                  />
                                }
                                label="HBeAg"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hepatitisScreeningTests['Anti-HAV']}
                                    onChange={() => handleHepatitisScreeningTestChange('Anti-HAV')}
                                    color="primary"
                                  />
                                }
                                label="Anti-HAV"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hepatitisScreeningTests['Anti-HCV']}
                                    onChange={() => handleHepatitisScreeningTestChange('Anti-HCV')}
                                    color="primary"
                                  />
                                }
                                label="Anti-HCV"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hepatitisScreeningTests['Anti-HB core']}
                                    onChange={() => handleHepatitisScreeningTestChange('Anti-HB core')}
                                    color="primary"
                                  />
                                }
                                label="Anti-HB core"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={hepatitisScreeningTests['Anti-HBsAg']}
                                    onChange={() => handleHepatitisScreeningTestChange('Anti-HBsAg')}
                                    color="primary"
                                  />
                                }
                                label="Anti-HBsAg"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>
                  </Grid>


                  {/* Vaccine Status Subsection */}

                  {/* Vaccine Status, STI Screening, and Advanced Virology Testing - Two Column Layout */}
                  <Grid container spacing={1}>
                    {/* Left Column - Vaccine Status and STI Screening */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Vaccine Status */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, color: 'black' }}>
                          Vaccine Status
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={vaccineStatusTests['MMR']}
                                    onChange={() => handleVaccineStatusTestChange('MMR')}
                                    color="primary"
                                  />
                                }
                                label="MMR"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={vaccineStatusTests['Varicella']}
                                    onChange={() => handleVaccineStatusTestChange('Varicella')}
                                    color="primary"
                                  />
                                }
                                label="Varicella"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={vaccineStatusTests['Anti-HBsAg']}
                                    onChange={() => handleVaccineStatusTestChange('Anti-HBsAg')}
                                    color="primary"
                                  />
                                }
                                label="Anti-HBsAg"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>

                      {/* STI Screening */}
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 0.5, flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, color: 'black' }}>
                          STI Screening
                        </Typography>
                        <FormGroup>
                          <Grid container spacing={0.25}>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={stiScreeningTests['HSV1']}
                                    onChange={() => handleStiScreeningTestChange('HSV1')}
                                    color="primary"
                                  />
                                }
                                label="HSV1"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={stiScreeningTests['HSV2']}
                                    onChange={() => handleStiScreeningTestChange('HSV2')}
                                    color="primary"
                                  />
                                }
                                label="HSV2"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={stiScreeningTests['Chlamydia']}
                                    onChange={() => handleStiScreeningTestChange('Chlamydia')}
                                    color="primary"
                                  />
                                }
                                label="Chlamydia"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
name="2h PPG"
                                    checked={stiScreeningTests['HIV']}
                                    onChange={() => handleStiScreeningTestChange('HIV')}
                                    color="primary"
                                  />
                                }
                                label="HIV"
                              />
                            </Grid>
                          </Grid>
                        </FormGroup>
                      </Box>
                    </Grid>

                    {/* Right Column - Advanced Virology Testing */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 0.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, color: 'black' }}>
                          Advanced Virology Testing
                        </Typography>
                        <Paper elevation={1} sx={{ p: 0.5, backgroundColor: 'white', flex: 1 }}>
                          <Grid container spacing={0.25}>
                            {/* Header Row */}
                            <Grid item xs={3}>
                              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'black', fontSize: '0.7rem', py: 0.25 }}>
                                Organism
                              </Typography>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'black', fontSize: '0.7rem', py: 0.25 }}>
                                Genotyping
                              </Typography>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'black', fontSize: '0.7rem', py: 0.25 }}>
                                Resistance
                              </Typography>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'black', fontSize: '0.7rem', py: 0.25 }}>
                                Viral Load
                              </Typography>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'black', fontSize: '0.7rem', py: 0.25 }}>
                                PCR
                              </Typography>
                            </Grid>

                            {/* Data Rows */}
                            {Object.entries(virologyGridTests).map(([organism, tests]) => (
                              <Fragment key={organism}>
                                <Grid item xs={3}>
                                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.7rem', py: 0.25 }}>
                                    {organism}
                                  </Typography>
                                </Grid>
                                <Grid item xs={2.25}>
                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.125 }}>
                                    <Checkbox
name="CMV"
                                      checked={tests['Genotyping']}
                                      onChange={() => handleVirologyGridTestChange(organism, 'Genotyping')}
                                      color="primary"
                                      size="small"
                                      sx={{ py: 0.25 }}
                                    />
                                  </Box>
                                </Grid>
                                <Grid item xs={2.25}>
                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.125 }}>
                                    <Checkbox
name="CMV"
                                      checked={tests['Resistance']}
                                      onChange={() => handleVirologyGridTestChange(organism, 'Resistance')}
                                      color="primary"
                                      size="small"
                                      sx={{ py: 0.25 }}
                                    />
                                  </Box>
                                </Grid>
                                <Grid item xs={2.25}>
                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.125 }}>
                                    <Checkbox
name="CMV"
                                      checked={tests['Viral Load']}
                                      onChange={() => handleVirologyGridTestChange(organism, 'Viral Load')}
                                      color="primary"
                                      size="small"
                                      sx={{ py: 0.25 }}
                                    />
                                  </Box>
                                </Grid>
                                <Grid item xs={2.25}>
                                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.125 }}>
                                    <Checkbox
name="CMV"
                                      checked={tests['PCR']}
                                      onChange={() => handleVirologyGridTestChange(organism, 'PCR')}
                                      color="primary"
                                      size="small"
                                      sx={{ py: 0.25 }}
                                    />
                                  </Box>
                                </Grid>
                              </Fragment>
                            ))}
                          </Grid>
                        </Paper>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Other Tests Subsection */}
                  <Box sx={{ mb: 1.5, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'black' }}>
                      Other Tests
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['CMV']}
                                onChange={() => handleVirologyOtherTestChange('CMV')}
                                color="primary"
                              />
                            }
                            label="CMV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['EBV']}
                                onChange={() => handleVirologyOtherTestChange('EBV')}
                                color="primary"
                              />
                            }
                            label="EBV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['TORCH']}
                                onChange={() => handleVirologyOtherTestChange('TORCH')}
                                color="primary"
                              />
                            }
                            label="TORCH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Viral Culture']}
                                onChange={() => handleVirologyOtherTestChange('Viral Culture')}
                                color="primary"
                              />
                            }
                            label="Viral Culture"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['HTLV']}
                                onChange={() => handleVirologyOtherTestChange('HTLV')}
                                color="primary"
                              />
                            }
                            label="HTLV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Western Blot']}
                                onChange={() => handleVirologyOtherTestChange('Western Blot')}
                                color="primary"
                              />
                            }
                            label="Western Blot"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Toxoplasma gondii']}
                                onChange={() => handleVirologyOtherTestChange('Toxoplasma gondii')}
                                color="primary"
                              />
                            }
                            label="Toxoplasma gondii"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Stool Rotavirus']}
                                onChange={() => handleVirologyOtherTestChange('Stool Rotavirus')}
                                color="primary"
                              />
                            }
                            label="Stool Rotavirus"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Mumps']}
                                onChange={() => handleVirologyOtherTestChange('Mumps')}
                                color="primary"
                              />
                            }
                            label="Mumps"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Influenza']}
                                onChange={() => handleVirologyOtherTestChange('Influenza')}
                                color="primary"
                              />
                            }
                            label="Influenza"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={12/7}>
                          <FormControlLabel
                            control={
                              <Checkbox
name="Amylase"
                                checked={virologyOtherTests['Other']}
                                onChange={() => handleVirologyOtherTestChange('Other')}
                                color="primary"
                              />
                            }
                            label="Other"
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Other Test Text Input */}
                      {virologyOtherTests['Other'] && (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            fullWidth
                            label="Specify other virology test"
                            placeholder="Enter the name of the other test..."
                            value={virologyOtherTestText}
                            onChange={(e) => setVirologyOtherTestText(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: 400 }}
                          />
                        </Box>
                      )}
                    </FormGroup>
                  </Box>

            </Paper>
          </Box>

          {/* Executive Profile Tests */}
          <Box sx={{ mt: 2 }}>
            <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'white' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'black', fontSize: '1rem' }}>
                Executive Profile Tests
              </Typography>
              <Box sx={{ mb: 0.625, border: '1px solid #000000', borderRadius: 1, p: 1.5 }}>
                <FormGroup>
                  <Grid container spacing={1}>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="Executive Profile"
                            checked={executiveProfileTests['Executive Profile']}
                            onChange={() => handleExecutiveProfileTestChange('Executive Profile')}
                            color="primary"
                          />
                        }
                        label="Executive Profile"
                      />
                    </Grid>
                  </Grid>
                </FormGroup>
              </Box>
            </Paper>
          </Box>

          {/* Clinical Information */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
              Clinical Information
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide relevant clinical information, symptoms, and reason for testing..."
              variant="outlined"
              sx={{ mt: 2 }}
            />
          </Box>

          {/* Urgency */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.625, color: 'black' }}>
              Urgency
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
name="Routine (Results within 24-48 hours)"
                          checked={urgency === 'routine'}
                          onChange={() => setUrgency('routine')}
                          color="primary"
                        />
                      }
                      label="Routine (Results within 24-48 hours)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
name="Routine (Results within 24-48 hours)"
                          checked={urgency === 'urgent'}
                          onChange={() => setUrgency('urgent')}
                          color="primary"
                        />
                      }
                      label="Urgent (Results within 4-6 hours)"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
name="Routine (Results within 24-48 hours)"
                          checked={urgency === 'stat'}
                          onChange={() => setUrgency('stat')}
                          color="primary"
                        />
                      }
                      label="Stat (Results within 1 hour)"
                    />
                  </Grid>
                </Grid>
              </FormGroup>
            </Box>
          </Box>
        </Paper>
        </div>
      </Container>

      {/* Wait Mask Overlay */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)'
        }}
        open={isGenerating || isSending}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <CircularProgress 
            size={60} 
            color="inherit" 
            sx={{ mb: 2 }}
          />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            {isGenerating ? 'Generating PDF...' : 'Sending Email...'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            Please wait while we process your request
          </Typography>
        </Box>
      </Backdrop>
    </>
  );
}
