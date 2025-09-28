'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Header from '../../components/Header';
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Print,
  Save,
  ExpandMore,
  PictureAsPdf,
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function LabRequisition() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
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

  const [bloodBankTests, setBloodBankTests] = useState({
    'Group & Rh': false,
    'Direct Coombs': false,
    'Antibody ID': false,
    'Indirect Coombs': false
  });

  const [antibioticTreatment, setAntibioticTreatment] = useState('');

  const [microscopyTests, setMicroscopyTests] = useState({
    'Gram stain': false,
    'AFB/ZN': false,
    'India ink': false
  });

  const [toxinDetectionTests, setToxinDetectionTests] = useState({
    'C. difficile': false
  });

  const [bacteriologyOtherTests, setBacteriologyOtherTests] = useState({
    'Culture and sensitivity': false,
    'Other': false
  });

  const [bacteriologyOtherTestText, setBacteriologyOtherTestText] = useState('');

  const [parasitologyOtherTests, setParasitologyOtherTests] = useState({
    'Ova and parasites (O & P)': false,
    'Other': false
  });

  const [parasitologyOtherTestText, setParasitologyOtherTestText] = useState('');

  const [eiaTests, setEiaTests] = useState({
    'E. histolytica': false,
    'malaria': false,
    'cryptosporidia': false,
    'Giardia': false,
    'Toxocara': false,
    'Filariasis': false
  });

  const [currentTreatment, setCurrentTreatment] = useState('');
  const [enterTreatment, setEnterTreatment] = useState(false);

  const [mycologyTests, setMycologyTests] = useState({
    'Fungal culture': false,
    'Environmental': false,
    'Fungal ID (isolate)': false,
    'Cryptococcal Antigen': false
  });

  const [mycologyMicroscopyTests, setMycologyMicroscopyTests] = useState({
    'KOH': false,
    'Calcofluor white': false
  });

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

  const handleBloodBankTestChange = (testName) => {
    setBloodBankTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleMicroscopyTestChange = (testName) => {
    setMicroscopyTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleToxinDetectionTestChange = (testName) => {
    setToxinDetectionTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleBacteriologyOtherTestChange = (testName) => {
    setBacteriologyOtherTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
    
    // Clear the text input when "Other" is unchecked
    if (testName === 'Other') {
      setBacteriologyOtherTestText('');
    }
  };

  const handleParasitologyOtherTestChange = (testName) => {
    setParasitologyOtherTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
    
    // Clear the text input when "Other" is unchecked
    if (testName === 'Other') {
      setParasitologyOtherTestText('');
    }
  };

  const handleEiaTestChange = (testName) => {
    setEiaTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleMycologyTestChange = (testName) => {
    setMycologyTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleMycologyMicroscopyTestChange = (testName) => {
    setMycologyMicroscopyTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
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
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      });

      // Calculate dimensions for letter size (8.5" x 11")
      const imgWidth = 210; // A4 width in mm (8.5 inches)
      const pageHeight = 295; // A4 height in mm (11 inches)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save('lab-requisition.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (isLoading || !mounted) {
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
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom color="primary">
            Access Denied
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => window.history.back()}
            sx={{ textTransform: 'none', mr: 2 }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" color="primary" sx={{ flexGrow: 1 }}>
            Lab Requisition
          </Typography>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => window.print()}
            sx={{ textTransform: 'none', mr: 1 }}
          >
            Print
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
            variant="outlined"
            startIcon={<Save />}
            sx={{ textTransform: 'none' }}
          >
            Save
          </Button>
        </Box>

        {/* Main Content - 3 Column Layout */}
        <div id="lab-requisition-content">
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Column 1 - Patient Information */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                    Patient Information
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      value={user.name || ''}
                      variant="standard"
                      sx={{ mb: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      variant="standard"
                      sx={{ mb: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Patient ID"
                      variant="standard"
                      sx={{ mb: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      variant="standard"
                      sx={{ mb: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      variant="standard"
                      sx={{ mb: 2 }}
                      InputProps={{ readOnly: true }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Column 2 - Section A: Requisition Physician */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                    A. Requisition Physician
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Doctor's Name"
                      variant="standard"
                      defaultValue="Dr. Sarah Johnson"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      variant="standard"
                      defaultValue="123 Medical Plaza\nSuite 456\nKingston, Jamaica"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Telephone Number"
                      variant="standard"
                      defaultValue="(876) 555-0123"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Fax Number"
                      variant="standard"
                      defaultValue="(876) 555-0124"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Registration Number"
                      variant="standard"
                      defaultValue="JM12345"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      variant="standard"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                        <Typography variant="body2" color="text.secondary">
                          Doctor's Signature
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Column 3 - Section B: Copies of Result */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
                    B. Copies of Result
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Doctor's Name"
                      variant="standard"
                      defaultValue="Dr. Sarah Johnson"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={3}
                      variant="standard"
                      defaultValue="123 Medical Plaza\nSuite 456\nKingston, Jamaica"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Telephone Number"
                      variant="standard"
                      defaultValue="(876) 555-0123"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Fax Number"
                      variant="standard"
                      defaultValue="(876) 555-0124"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Registration Number"
                      variant="standard"
                      defaultValue="JM12345"
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Date"
                      type="date"
                      variant="standard"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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
                        <Typography variant="body2" color="text.secondary">
                          Doctor's Signature
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Lab Tests Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
              Laboratory Tests Requested
            </Typography>
            <Paper variant="outlined" sx={{ mt: 2 }}>
              {/* Hematology Section */}
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="hematology-content"
                  id="hematology-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Hematology
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Routine
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hematologyTests.CBC}
                                onChange={() => handleHematologyTestChange('CBC')}
                                color="primary"
                              />
                            }
                            label="CBC"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hematologyTests.RETIC}
                                onChange={() => handleHematologyTestChange('RETIC')}
                                color="primary"
                              />
                            }
                            label="RETIC"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hematologyTests.ESR}
                                onChange={() => handleHematologyTestChange('ESR')}
                                color="primary"
                              />
                            }
                            label="ESR"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hematologyTests['Info Mono']}
                                onChange={() => handleHematologyTestChange('Info Mono')}
                                color="primary"
                              />
                            }
                            label="Info Mono"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hematologyTests['CSF/Fluid']}
                                onChange={() => handleHematologyTestChange('CSF/Fluid')}
                                color="primary"
                              />
                            }
                            label="CSF/Fluid"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Coagulation Tests Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Coagulation Tests
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests.PT}
                                onChange={() => handleCoagulationTestChange('PT')}
                                color="primary"
                              />
                            }
                            label="PT"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests.PTT}
                                onChange={() => handleCoagulationTestChange('PTT')}
                                color="primary"
                              />
                            }
                            label="PTT"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests.INR}
                                onChange={() => handleCoagulationTestChange('INR')}
                                color="primary"
                              />
                            }
                            label="INR"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests.Fibrinogen}
                                onChange={() => handleCoagulationTestChange('Fibrinogen')}
                                color="primary"
                              />
                            }
                            label="Fibrinogen"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Thrombin Time']}
                                onChange={() => handleCoagulationTestChange('Thrombin Time')}
                                color="primary"
                              />
                            }
                            label="Thrombin Time"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Bleeding Time']}
                                onChange={() => handleCoagulationTestChange('Bleeding Time')}
                                color="primary"
                              />
                            }
                            label="Bleeding Time"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests.Ristocetin}
                                onChange={() => handleCoagulationTestChange('Ristocetin')}
                                color="primary"
                              />
                            }
                            label="Ristocetin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests.FDP}
                                onChange={() => handleCoagulationTestChange('FDP')}
                                color="primary"
                              />
                            }
                            label="FDP"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Mixing Studies']}
                                onChange={() => handleCoagulationTestChange('Mixing Studies')}
                                color="primary"
                              />
                            }
                            label="Mixing Studies"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Lupus Anticoagulant']}
                                onChange={() => handleCoagulationTestChange('Lupus Anticoagulant')}
                                color="primary"
                              />
                            }
                            label="Lupus Anticoagulant"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Platelet Aggregation']}
                                onChange={() => handleCoagulationTestChange('Platelet Aggregation')}
                                color="primary"
                              />
                            }
                            label="Platelet Aggregation"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Factor Assay XIII']}
                                onChange={() => handleCoagulationTestChange('Factor Assay XIII')}
                                color="primary"
                              />
                            }
                            label="Factor Assay XIII"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={coagulationTests['Factor Assay IX']}
                                onChange={() => handleCoagulationTestChange('Factor Assay IX')}
                                color="primary"
                              />
                            }
                            label="Factor Assay IX"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Special Tests Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Special Tests
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={specialTests['HbA2']}
                                onChange={() => handleSpecialTestChange('HbA2')}
                                color="primary"
                              />
                            }
                            label={
                              <Typography component="span">
                                HbA<sub>2</sub>
                              </Typography>
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={specialTests["Ham's"]}
                                onChange={() => handleSpecialTestChange("Ham's")}
                                color="primary"
                              />
                            }
                            label="Ham's"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={specialTests['LAP Score']}
                                onChange={() => handleSpecialTestChange('LAP Score')}
                                color="primary"
                              />
                            }
                            label="LAP Score"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={specialTests['Osmotic Fragility']}
                                onChange={() => handleSpecialTestChange('Osmotic Fragility')}
                                color="primary"
                              />
                            }
                            label="Osmotic Fragility"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={specialTests['Urine Haemosiderin']}
                                onChange={() => handleSpecialTestChange('Urine Haemosiderin')}
                                color="primary"
                              />
                            }
                            label="Urine Haemosiderin"
                          />
                        </Grid>
                      </Grid>
                    </FormGroup>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Clinical Chemistry */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="clinical-chemistry-content"
                  id="clinical-chemistry-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Clinical Chemistry
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Electrolytes and Renal Function Tests */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Electrolytes and Renal Function Tests
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.Na}
                                onChange={() => handleElectrolytesTestChange('Na')}
                                color="primary"
                              />
                            }
                            label="Na"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.K}
                                onChange={() => handleElectrolytesTestChange('K')}
                                color="primary"
                              />
                            }
                            label="K"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.Cl}
                                onChange={() => handleElectrolytesTestChange('Cl')}
                                color="primary"
                              />
                            }
                            label="Cl"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.HCO3}
                                onChange={() => handleElectrolytesTestChange('HCO3')}
                                color="primary"
                              />
                            }
                            label="HCO3"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.Urea}
                                onChange={() => handleElectrolytesTestChange('Urea')}
                                color="primary"
                              />
                            }
                            label="Urea"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.BUN}
                                onChange={() => handleElectrolytesTestChange('BUN')}
                                color="primary"
                              />
                            }
                            label="BUN"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.Creatinine}
                                onChange={() => handleElectrolytesTestChange('Creatinine')}
                                color="primary"
                              />
                            }
                            label="Creatinine"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.Phosphorus}
                                onChange={() => handleElectrolytesTestChange('Phosphorus')}
                                color="primary"
                              />
                            }
                            label="Phosphorus"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests.Calcium}
                                onChange={() => handleElectrolytesTestChange('Calcium')}
                                color="primary"
                              />
                            }
                            label="Calcium"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={electrolytesTests['Uric Acid']}
                                onChange={() => handleElectrolytesTestChange('Uric Acid')}
                                color="primary"
                              />
                            }
                            label="Uric Acid"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Blood Sugar Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Blood Sugar
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bloodSugarTests['Random Glucose']}
                                onChange={() => handleBloodSugarTestChange('Random Glucose')}
                                color="primary"
                              />
                            }
                            label="Random Glucose"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bloodSugarTests['Fasting Glucose']}
                                onChange={() => handleBloodSugarTestChange('Fasting Glucose')}
                                color="primary"
                              />
                            }
                            label="Fasting Glucose"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bloodSugarTests['2h PPG']}
                                onChange={() => handleBloodSugarTestChange('2h PPG')}
                                color="primary"
                              />
                            }
                            label="2h PPG"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bloodSugarTests['OGTT']}
                                onChange={() => handleBloodSugarTestChange('OGTT')}
                                color="primary"
                              />
                            }
                            label="OGTT"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Tumor Markers Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Tumor Markers
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={tumorMarkers['AFP']}
                                onChange={() => handleTumorMarkerChange('AFP')}
                                color="primary"
                              />
                            }
                            label="AFP"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={tumorMarkers['CEA']}
                                onChange={() => handleTumorMarkerChange('CEA')}
                                color="primary"
                              />
                            }
                            label="CEA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={tumorMarkers['CA-125']}
                                onChange={() => handleTumorMarkerChange('CA-125')}
                                color="primary"
                              />
                            }
                            label="CA-125"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={tumorMarkers['CA-15-3']}
                                onChange={() => handleTumorMarkerChange('CA-15-3')}
                                color="primary"
                              />
                            }
                            label="CA-15-3"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Serum Protein and Lipids Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Serum Protein and Lipids
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['Total Protein']}
                                onChange={() => handleSerumProteinLipidsChange('Total Protein')}
                                color="primary"
                              />
                            }
                            label="Total Protein"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['Albumin']}
                                onChange={() => handleSerumProteinLipidsChange('Albumin')}
                                color="primary"
                              />
                            }
                            label="Albumin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['Globulin']}
                                onChange={() => handleSerumProteinLipidsChange('Globulin')}
                                color="primary"
                              />
                            }
                            label="Globulin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['Total Cholesterol']}
                                onChange={() => handleSerumProteinLipidsChange('Total Cholesterol')}
                                color="primary"
                              />
                            }
                            label="Total Cholesterol"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['LDL']}
                                onChange={() => handleSerumProteinLipidsChange('LDL')}
                                color="primary"
                              />
                            }
                            label="LDL"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['HDL']}
                                onChange={() => handleSerumProteinLipidsChange('HDL')}
                                color="primary"
                              />
                            }
                            label="HDL"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['Triglyceride']}
                                onChange={() => handleSerumProteinLipidsChange('Triglyceride')}
                                color="primary"
                              />
                            }
                            label="Triglyceride"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinLipids['Protein Electrophoresis']}
                                onChange={() => handleSerumProteinLipidsChange('Protein Electrophoresis')}
                                color="primary"
                              />
                            }
                            label="Protein Electrophoresis"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Urine Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Urine
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Na']}
                                onChange={() => handleUrineTestChange('Na')}
                                color="primary"
                              />
                            }
                            label="Na"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Urinalysis']}
                                onChange={() => handleUrineTestChange('Urinalysis')}
                                color="primary"
                              />
                            }
                            label="Urinalysis"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['K']}
                                onChange={() => handleUrineTestChange('K')}
                                color="primary"
                              />
                            }
                            label="K"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Microscopy']}
                                onChange={() => handleUrineTestChange('Microscopy')}
                                color="primary"
                              />
                            }
                            label="Microscopy"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Urea']}
                                onChange={() => handleUrineTestChange('Urea')}
                                color="primary"
                              />
                            }
                            label="Urea"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['VMA']}
                                onChange={() => handleUrineTestChange('VMA')}
                                color="primary"
                              />
                            }
                            label="VMA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Creatinine']}
                                onChange={() => handleUrineTestChange('Creatinine')}
                                color="primary"
                              />
                            }
                            label="Creatinine"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Uric Acid']}
                                onChange={() => handleUrineTestChange('Uric Acid')}
                                color="primary"
                              />
                            }
                            label="Uric Acid"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Creatinine Clearance']}
                                onChange={() => handleUrineTestChange('Creatinine Clearance')}
                                color="primary"
                              />
                            }
                            label="Creatinine Clearance"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Calcium']}
                                onChange={() => handleUrineTestChange('Calcium')}
                                color="primary"
                              />
                            }
                            label="Calcium"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Phosphorus']}
                                onChange={() => handleUrineTestChange('Phosphorus')}
                                color="primary"
                              />
                            }
                            label="Phosphorus"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Protein']}
                                onChange={() => handleUrineTestChange('Protein')}
                                color="primary"
                              />
                            }
                            label="Protein"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['17-KS']}
                                onChange={() => handleUrineTestChange('17-KS')}
                                color="primary"
                              />
                            }
                            label="17-KS"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['17-KGS']}
                                onChange={() => handleUrineTestChange('17-KGS')}
                                color="primary"
                              />
                            }
                            label="17-KGS"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Protein Electrophoresis']}
                                onChange={() => handleUrineTestChange('Protein Electrophoresis')}
                                color="primary"
                              />
                            }
                            label="Protein Electrophoresis"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={urineTests['Cortisol']}
                                onChange={() => handleUrineTestChange('Cortisol')}
                                color="primary"
                              />
                            }
                            label="Cortisol"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Hormones Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Hormones
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['FSH']}
                                onChange={() => handleHormoneTestChange('FSH')}
                                color="primary"
                              />
                            }
                            label="FSH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['TSH']}
                                onChange={() => handleHormoneTestChange('TSH')}
                                color="primary"
                              />
                            }
                            label="TSH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['FT3']}
                                onChange={() => handleHormoneTestChange('FT3')}
                                color="primary"
                              />
                            }
                            label="FT3"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['DHEA-S']}
                                onChange={() => handleHormoneTestChange('DHEA-S')}
                                color="primary"
                              />
                            }
                            label="DHEA-S"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['FT4']}
                                onChange={() => handleHormoneTestChange('FT4')}
                                color="primary"
                              />
                            }
                            label="FT4"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['Cortisol']}
                                onChange={() => handleHormoneTestChange('Cortisol')}
                                color="primary"
                              />
                            }
                            label="Cortisol"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['ACTH']}
                                onChange={() => handleHormoneTestChange('ACTH')}
                                color="primary"
                              />
                            }
                            label="ACTH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['Prolactin']}
                                onChange={() => handleHormoneTestChange('Prolactin')}
                                color="primary"
                              />
                            }
                            label="Prolactin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['LH']}
                                onChange={() => handleHormoneTestChange('LH')}
                                color="primary"
                              />
                            }
                            label="LH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['Beta-HCG']}
                                onChange={() => handleHormoneTestChange('Beta-HCG')}
                                color="primary"
                              />
                            }
                            label="Beta-HCG"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['Oestradiol']}
                                onChange={() => handleHormoneTestChange('Oestradiol')}
                                color="primary"
                              />
                            }
                            label="Oestradiol"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['Progesterone']}
                                onChange={() => handleHormoneTestChange('Progesterone')}
                                color="primary"
                              />
                            }
                            label="Progesterone"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hormoneTests['Testosterone']}
                                onChange={() => handleHormoneTestChange('Testosterone')}
                                color="primary"
                              />
                            }
                            label="Testosterone"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Cardiac and Liver Function Test Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Cardiac and Liver Function Test
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['CPK']}
                                onChange={() => handleCardiacLiverTestChange('CPK')}
                                color="primary"
                              />
                            }
                            label="CPK"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['ALT']}
                                onChange={() => handleCardiacLiverTestChange('ALT')}
                                color="primary"
                              />
                            }
                            label="ALT"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['Bili D']}
                                onChange={() => handleCardiacLiverTestChange('Bili D')}
                                color="primary"
                              />
                            }
                            label="Bili D"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['Troponin I']}
                                onChange={() => handleCardiacLiverTestChange('Troponin I')}
                                color="primary"
                              />
                            }
                            label="Troponin I"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['AST']}
                                onChange={() => handleCardiacLiverTestChange('AST')}
                                color="primary"
                              />
                            }
                            label="AST"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['Bili T']}
                                onChange={() => handleCardiacLiverTestChange('Bili T')}
                                color="primary"
                              />
                            }
                            label="Bili T"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['LDH']}
                                onChange={() => handleCardiacLiverTestChange('LDH')}
                                color="primary"
                              />
                            }
                            label="LDH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={cardiacLiverTests['ALP']}
                                onChange={() => handleCardiacLiverTestChange('ALP')}
                                color="primary"
                              />
                            }
                            label="ALP"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Other Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Other
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Amylase']}
                                onChange={() => handleOtherTestChange('Amylase')}
                                color="primary"
                              />
                            }
                            label="Amylase"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Insulin (F)']}
                                onChange={() => handleOtherTestChange('Insulin (F)')}
                                color="primary"
                              />
                            }
                            label="Insulin (F)"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['CSF glucose']}
                                onChange={() => handleOtherTestChange('CSF glucose')}
                                color="primary"
                              />
                            }
                            label="CSF glucose"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Vitamin B12/Folic acid']}
                                onChange={() => handleOtherTestChange('Vitamin B12/Folic acid')}
                                color="primary"
                              />
                            }
                            label="Vitamin B12/Folic acid"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Serum Iron/TIBC']}
                                onChange={() => handleOtherTestChange('Serum Iron/TIBC')}
                                color="primary"
                              />
                            }
                            label="Serum Iron/TIBC"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['PTH']}
                                onChange={() => handleOtherTestChange('PTH')}
                                color="primary"
                              />
                            }
                            label="PTH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Ferritin']}
                                onChange={() => handleOtherTestChange('Ferritin')}
                                color="primary"
                              />
                            }
                            label="Ferritin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Lithium']}
                                onChange={() => handleOtherTestChange('Lithium')}
                                color="primary"
                              />
                            }
                            label="Lithium"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['CSF Protein']}
                                onChange={() => handleOtherTestChange('CSF Protein')}
                                color="primary"
                              />
                            }
                            label="CSF Protein"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Beta-Microglubulin']}
                                onChange={() => handleOtherTestChange('Beta-Microglubulin')}
                                color="primary"
                              />
                            }
                            label="Beta-Microglubulin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Salicylate']}
                                onChange={() => handleOtherTestChange('Salicylate')}
                                color="primary"
                              />
                            }
                            label="Salicylate"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Lipase']}
                                onChange={() => handleOtherTestChange('Lipase')}
                                color="primary"
                              />
                            }
                            label="Lipase"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Digoxin']}
                                onChange={() => handleOtherTestChange('Digoxin')}
                                color="primary"
                              />
                            }
                            label="Digoxin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['C-peptide']}
                                onChange={() => handleOtherTestChange('C-peptide')}
                                color="primary"
                              />
                            }
                            label="C-peptide"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={otherTests['Dilantin']}
                                onChange={() => handleOtherTestChange('Dilantin')}
                                color="primary"
                              />
                            }
                            label="Dilantin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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
                        <Box sx={{ mt: 2 }}>
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
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Immunology */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="immunology-content"
                  id="immunology-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    IMMUNOLOGY
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Serology Subsection */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Serology
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serologyTests['VDRL']}
                                onChange={() => handleSerologyTestChange('VDRL')}
                                color="primary"
                              />
                            }
                            label="VDRL"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serologyTests['FTA']}
                                onChange={() => handleSerologyTestChange('FTA')}
                                color="primary"
                              />
                            }
                            label="FTA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serologyTests['Widal']}
                                onChange={() => handleSerologyTestChange('Widal')}
                                color="primary"
                              />
                            }
                            label="Widal"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serologyTests['ASTO']}
                                onChange={() => handleSerologyTestChange('ASTO')}
                                color="primary"
                              />
                            }
                            label="ASTO"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Autoantibodies Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Autoantibodies
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['RF']}
                                onChange={() => handleAutoantibodiesTestChange('RF')}
                                color="primary"
                              />
                            }
                            label="RF"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['ANA']}
                                onChange={() => handleAutoantibodiesTestChange('ANA')}
                                color="primary"
                              />
                            }
                            label="ANA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['ENA']}
                                onChange={() => handleAutoantibodiesTestChange('ENA')}
                                color="primary"
                              />
                            }
                            label="ENA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['Anti-CCP']}
                                onChange={() => handleAutoantibodiesTestChange('Anti-CCP')}
                                color="primary"
                              />
                            }
                            label="Anti-CCP"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['Thyroglobulin']}
                                onChange={() => handleAutoantibodiesTestChange('Thyroglobulin')}
                                color="primary"
                              />
                            }
                            label="Thyroglobulin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['ANCA']}
                                onChange={() => handleAutoantibodiesTestChange('ANCA')}
                                color="primary"
                              />
                            }
                            label="ANCA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['cardiolipin']}
                                onChange={() => handleAutoantibodiesTestChange('cardiolipin')}
                                color="primary"
                              />
                            }
                            label="cardiolipin"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['Anti-Beta2GPI']}
                                onChange={() => handleAutoantibodiesTestChange('Anti-Beta2GPI')}
                                color="primary"
                              />
                            }
                            label="Anti-Beta2GPI"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['Mitochondrial']}
                                onChange={() => handleAutoantibodiesTestChange('Mitochondrial')}
                                color="primary"
                              />
                            }
                            label="Mitochondrial"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['Gastric Parietal Cell']}
                                onChange={() => handleAutoantibodiesTestChange('Gastric Parietal Cell')}
                                color="primary"
                              />
                            }
                            label="Gastric Parietal Cell"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={autoantibodiesTests['dsDNA']}
                                onChange={() => handleAutoantibodiesTestChange('dsDNA')}
                                color="primary"
                              />
                            }
                            label="dsDNA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Serum Protein Concentrate Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Serum Protein Concentrate
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinConcentrate['CRP']}
                                onChange={() => handleSerumProteinConcentrateChange('CRP')}
                                color="primary"
                              />
                            }
                            label="CRP"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinConcentrate['IgA']}
                                onChange={() => handleSerumProteinConcentrateChange('IgA')}
                                color="primary"
                              />
                            }
                            label="IgA"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={serumProteinConcentrate['IgG']}
                                onChange={() => handleSerumProteinConcentrateChange('IgG')}
                                color="primary"
                              />
                            }
                            label="IgG"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Lymphocyte Enumeration Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Lymphocyte Enumeration
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={lymphocyteEnumeration['Viral load']}
                                onChange={() => handleLymphocyteEnumerationChange('Viral load')}
                                color="primary"
                              />
                            }
                            label="Viral load"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={lymphocyteEnumeration['CD4']}
                                onChange={() => handleLymphocyteEnumerationChange('CD4')}
                                color="primary"
                              />
                            }
                            label="CD4"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={lymphocyteEnumeration['CD8']}
                                onChange={() => handleLymphocyteEnumerationChange('CD8')}
                                color="primary"
                              />
                            }
                            label="CD8"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={lymphocyteEnumeration['T lymphocytes']}
                                onChange={() => handleLymphocyteEnumerationChange('T lymphocytes')}
                                color="primary"
                              />
                            }
                            label="T lymphocytes"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={lymphocyteEnumeration['B lymphocytes (CD19/20)']}
                                onChange={() => handleLymphocyteEnumerationChange('B lymphocytes (CD19/20)')}
                                color="primary"
                              />
                            }
                            label="B lymphocytes (CD19/20)"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Other Tests Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Other Tests
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={immunologyOtherTests['H. pylori']}
                                onChange={() => handleImmunologyOtherTestChange('H. pylori')}
                                color="primary"
                              />
                            }
                            label="H. pylori"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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
                        <Box sx={{ mt: 2 }}>
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
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Blood Bank */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="blood-bank-content"
                  id="blood-bank-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Blood Bank
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    <Grid container spacing={1}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bloodBankTests['Group & Rh']}
                              onChange={() => handleBloodBankTestChange('Group & Rh')}
                              color="primary"
                            />
                          }
                          label="Group & Rh"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bloodBankTests['Direct Coombs']}
                              onChange={() => handleBloodBankTestChange('Direct Coombs')}
                              color="primary"
                            />
                          }
                          label="Direct Coombs"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bloodBankTests['Antibody ID']}
                              onChange={() => handleBloodBankTestChange('Antibody ID')}
                              color="primary"
                            />
                          }
                          label="Antibody ID"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={bloodBankTests['Indirect Coombs']}
                              onChange={() => handleBloodBankTestChange('Indirect Coombs')}
                              color="primary"
                            />
                          }
                          label="Indirect Coombs"
                        />
                      </Grid>
                    </Grid>
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Bacteriology */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="bacteriology-content"
                  id="bacteriology-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Bacteriology
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Antibiotic Treatment Question */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Please state any current antibiotic treatment:
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Enter current antibiotic treatment details..."
                      value={antibioticTreatment}
                      onChange={(e) => setAntibioticTreatment(e.target.value)}
                      variant="outlined"
                      sx={{ maxWidth: 600 }}
                    />
                  </Box>

                  {/* Microscopy Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Microscopy
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={microscopyTests['Gram stain']}
                                onChange={() => handleMicroscopyTestChange('Gram stain')}
                                color="primary"
                              />
                            }
                            label="Gram stain"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={microscopyTests['AFB/ZN']}
                                onChange={() => handleMicroscopyTestChange('AFB/ZN')}
                                color="primary"
                              />
                            }
                            label="AFB/ZN"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={microscopyTests['India ink']}
                                onChange={() => handleMicroscopyTestChange('India ink')}
                                color="primary"
                              />
                            }
                            label="India ink"
                          />
                        </Grid>
                      </Grid>
                    </FormGroup>
                  </Box>

                  {/* Toxin Detection Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Toxin Detection
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={toxinDetectionTests['C. difficile']}
                                onChange={() => handleToxinDetectionTestChange('C. difficile')}
                                color="primary"
                              />
                            }
                            label="C. difficile"
                          />
                        </Grid>
                      </Grid>
                    </FormGroup>
                  </Box>

                  {/* Other Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Other
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bacteriologyOtherTests['Culture and sensitivity']}
                                onChange={() => handleBacteriologyOtherTestChange('Culture and sensitivity')}
                                color="primary"
                              />
                            }
                            label="Culture and sensitivity"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={bacteriologyOtherTests['Other']}
                                onChange={() => handleBacteriologyOtherTestChange('Other')}
                                color="primary"
                              />
                            }
                            label="Other"
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Other Test Text Input */}
                      {bacteriologyOtherTests['Other'] && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Specify other bacteriology test"
                            placeholder="Enter the name of the other test..."
                            value={bacteriologyOtherTestText}
                            onChange={(e) => setBacteriologyOtherTestText(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: 400 }}
                          />
                        </Box>
                      )}
                    </FormGroup>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Parasitology */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="parasitology-content"
                  id="parasitology-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Parasitology
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* General Parasitology Tests */}
                  <Box sx={{ mb: 3 }}>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={parasitologyOtherTests['Ova and parasites (O & P)']}
                                onChange={() => handleParasitologyOtherTestChange('Ova and parasites (O & P)')}
                                color="primary"
                              />
                            }
                            label="Ova and parasites (O & P)"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={parasitologyOtherTests['Other']}
                                onChange={() => handleParasitologyOtherTestChange('Other')}
                                color="primary"
                              />
                            }
                            label="Other"
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Other Test Text Input */}
                      {parasitologyOtherTests['Other'] && (
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Specify other parasitology test"
                            placeholder="Enter the name of the other test..."
                            value={parasitologyOtherTestText}
                            onChange={(e) => setParasitologyOtherTestText(e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ maxWidth: 400 }}
                          />
                        </Box>
                      )}
                    </FormGroup>
                  </Box>

                  {/* EIA Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      EIA
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={eiaTests['E. histolytica']}
                                onChange={() => handleEiaTestChange('E. histolytica')}
                                color="primary"
                              />
                            }
                            label="E. histolytica"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={eiaTests['malaria']}
                                onChange={() => handleEiaTestChange('malaria')}
                                color="primary"
                              />
                            }
                            label="malaria"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={eiaTests['cryptosporidia']}
                                onChange={() => handleEiaTestChange('cryptosporidia')}
                                color="primary"
                              />
                            }
                            label="cryptosporidia"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={eiaTests['Giardia']}
                                onChange={() => handleEiaTestChange('Giardia')}
                                color="primary"
                              />
                            }
                            label="Giardia"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={eiaTests['Toxocara']}
                                onChange={() => handleEiaTestChange('Toxocara')}
                                color="primary"
                              />
                            }
                            label="Toxocara"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={eiaTests['Filariasis']}
                                onChange={() => handleEiaTestChange('Filariasis')}
                                color="primary"
                              />
                            }
                            label="Filariasis"
                          />
                        </Grid>
                      </Grid>
                    </FormGroup>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Mycology */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="mycology-content"
                  id="mycology-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Mycology
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Current Treatment Question */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Please state any current treatment:
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={enterTreatment}
                          onChange={(e) => setEnterTreatment(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Enter treatment"
                      sx={{ mb: 2 }}
                    />
                    {enterTreatment && (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Enter current antifungal treatment details..."
                        value={currentTreatment}
                        onChange={(e) => setCurrentTreatment(e.target.value)}
                        variant="outlined"
                        sx={{ maxWidth: 600 }}
                      />
                    )}
                  </Box>

                  {/* General Mycology Tests */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mycologyTests['Fungal culture']}
                                onChange={() => handleMycologyTestChange('Fungal culture')}
                                color="primary"
                              />
                            }
                            label="Fungal culture"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mycologyTests['Environmental']}
                                onChange={() => handleMycologyTestChange('Environmental')}
                                color="primary"
                              />
                            }
                            label="Environmental"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mycologyTests['Fungal ID (isolate)']}
                                onChange={() => handleMycologyTestChange('Fungal ID (isolate)')}
                                color="primary"
                              />
                            }
                            label="Fungal ID (isolate)"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mycologyTests['Cryptococcal Antigen']}
                                onChange={() => handleMycologyTestChange('Cryptococcal Antigen')}
                                color="primary"
                              />
                            }
                            label="Cryptococcal Antigen"
                          />
                        </Grid>
                      </Grid>
                    </FormGroup>
                  </Box>

                  {/* Microscopy Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Microscopy
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mycologyMicroscopyTests['KOH']}
                                onChange={() => handleMycologyMicroscopyTestChange('KOH')}
                                color="primary"
                              />
                            }
                            label="KOH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={mycologyMicroscopyTests['Calcofluor white']}
                                onChange={() => handleMycologyMicroscopyTestChange('Calcofluor white')}
                                color="primary"
                              />
                            }
                            label="Calcofluor white"
                          />
                        </Grid>
                      </Grid>
                    </FormGroup>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Virology */}
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Accordion defaultExpanded>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  aria-controls="virology-content"
                  id="virology-header"
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Virology
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Fever and Rash Subsection */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Fever and Rash
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={feverRashTests['Dengue']}
                                onChange={() => handleFeverRashTestChange('Dengue')}
                                color="primary"
                              />
                            }
                            label="Dengue"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={feverRashTests['Rubella']}
                                onChange={() => handleFeverRashTestChange('Rubella')}
                                color="primary"
                              />
                            }
                            label="Rubella"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={feverRashTests['Measles']}
                                onChange={() => handleFeverRashTestChange('Measles')}
                                color="primary"
                              />
                            }
                            label="Measles"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={feverRashTests['Varicella']}
                                onChange={() => handleFeverRashTestChange('Varicella')}
                                color="primary"
                              />
                            }
                            label="Varicella"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Hepatitis Screening Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Hepatitis Screening
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hepatitisScreeningTests['HBsAg']}
                                onChange={() => handleHepatitisScreeningTestChange('HBsAg')}
                                color="primary"
                              />
                            }
                            label="HBsAg"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hepatitisScreeningTests['HBeAg']}
                                onChange={() => handleHepatitisScreeningTestChange('HBeAg')}
                                color="primary"
                              />
                            }
                            label="HBeAg"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hepatitisScreeningTests['Anti-HAV']}
                                onChange={() => handleHepatitisScreeningTestChange('Anti-HAV')}
                                color="primary"
                              />
                            }
                            label="Anti-HAV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hepatitisScreeningTests['Anti-HCV']}
                                onChange={() => handleHepatitisScreeningTestChange('Anti-HCV')}
                                color="primary"
                              />
                            }
                            label="Anti-HCV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={hepatitisScreeningTests['Anti-HB core']}
                                onChange={() => handleHepatitisScreeningTestChange('Anti-HB core')}
                                color="primary"
                              />
                            }
                            label="Anti-HB core"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Vaccine Status Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Vaccine Status
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={vaccineStatusTests['MMR']}
                                onChange={() => handleVaccineStatusTestChange('MMR')}
                                color="primary"
                              />
                            }
                            label="MMR"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={vaccineStatusTests['Varicella']}
                                onChange={() => handleVaccineStatusTestChange('Varicella')}
                                color="primary"
                              />
                            }
                            label="Varicella"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* STI Screening Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      STI Screening
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={3}>
                          <FormControlLabel
                            control={
                              <Checkbox
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

                  {/* Other Tests Subsection */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Other Tests
                    </Typography>
                    <FormGroup>
                      <Grid container spacing={1}>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['CMV']}
                                onChange={() => handleVirologyOtherTestChange('CMV')}
                                color="primary"
                              />
                            }
                            label="CMV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['EBV']}
                                onChange={() => handleVirologyOtherTestChange('EBV')}
                                color="primary"
                              />
                            }
                            label="EBV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['TORCH']}
                                onChange={() => handleVirologyOtherTestChange('TORCH')}
                                color="primary"
                              />
                            }
                            label="TORCH"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['Viral Culture']}
                                onChange={() => handleVirologyOtherTestChange('Viral Culture')}
                                color="primary"
                              />
                            }
                            label="Viral Culture"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['HTLV']}
                                onChange={() => handleVirologyOtherTestChange('HTLV')}
                                color="primary"
                              />
                            }
                            label="HTLV"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['Western Blot']}
                                onChange={() => handleVirologyOtherTestChange('Western Blot')}
                                color="primary"
                              />
                            }
                            label="Western Blot"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['Toxoplasma gondii']}
                                onChange={() => handleVirologyOtherTestChange('Toxoplasma gondii')}
                                color="primary"
                              />
                            }
                            label="Toxoplasma gondii"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['Stool Rotavirus']}
                                onChange={() => handleVirologyOtherTestChange('Stool Rotavirus')}
                                color="primary"
                              />
                            }
                            label="Stool Rotavirus"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['Mumps']}
                                onChange={() => handleVirologyOtherTestChange('Mumps')}
                                color="primary"
                              />
                            }
                            label="Mumps"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={virologyOtherTests['Influenza']}
                                onChange={() => handleVirologyOtherTestChange('Influenza')}
                                color="primary"
                              />
                            }
                            label="Influenza"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControlLabel
                            control={
                              <Checkbox
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
                        <Box sx={{ mt: 2 }}>
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

                  {/* Virology Grid Tests */}
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      Advanced Virology Testing
                    </Typography>
                    <Paper elevation={1} sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                      <Grid container spacing={1}>
                        {/* Header Row */}
                        <Grid item xs={3}>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
                            Organism
                          </Typography>
                        </Grid>
                        <Grid item xs={2.25}>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
                            Genotyping
                          </Typography>
                        </Grid>
                        <Grid item xs={2.25}>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
                            Resistance
                          </Typography>
                        </Grid>
                        <Grid item xs={2.25}>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
                            Viral Load
                          </Typography>
                        </Grid>
                        <Grid item xs={2.25}>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'primary.main' }}>
                            PCR
                          </Typography>
                        </Grid>

                        {/* Data Rows */}
                        {Object.entries(virologyGridTests).map(([organism, tests]) => (
                          <Fragment key={organism}>
                            <Grid item xs={3}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {organism}
                              </Typography>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Checkbox
                                  checked={tests['Genotyping']}
                                  onChange={() => handleVirologyGridTestChange(organism, 'Genotyping')}
                                  color="primary"
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Checkbox
                                  checked={tests['Resistance']}
                                  onChange={() => handleVirologyGridTestChange(organism, 'Resistance')}
                                  color="primary"
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Checkbox
                                  checked={tests['Viral Load']}
                                  onChange={() => handleVirologyGridTestChange(organism, 'Viral Load')}
                                  color="primary"
                                  size="small"
                                />
                              </Box>
                            </Grid>
                            <Grid item xs={2.25}>
                              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Checkbox
                                  checked={tests['PCR']}
                                  onChange={() => handleVirologyGridTestChange(organism, 'PCR')}
                                  color="primary"
                                  size="small"
                                />
                              </Box>
                            </Grid>
                          </Fragment>
                        ))}
                      </Grid>
                    </Paper>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Box>

          {/* Clinical Information */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
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
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom color="primary" sx={{ fontWeight: 600 }}>
              Urgency
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                ☐ Routine (Results within 24-48 hours)
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                ☐ Urgent (Results within 4-6 hours)
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                ☐ Stat (Results within 1 hour)
              </Typography>
            </Box>
          </Box>
        </Paper>
        </div>
      </Container>
    </>
  );
}
