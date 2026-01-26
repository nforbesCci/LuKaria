'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useBasicAccess } from '../../hooks/useAccessControl';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  savePhotographConsent, 
  setConsentChanges, 
  resetConsentSaveFlag, 
  fetchPhotographConsent,
  saveMounjaroConsent,
  setMounjaroConsentChanges,
  resetMounjaroConsentSaveFlag,
  fetchMounjaroConsent,
  saveSemaglutideConsent,
  setSemaglutideConsentChanges,
  resetSemaglutideConsentSaveFlag,
  fetchSemaglutideConsent,
  saveTelehealthConsent,
  setTelehealthConsentChanges,
  resetTelehealthConsentSaveFlag,
  fetchTelehealthConsent
} from '../../store/slices/consentSlice';
import { updatePreAppointmentTaskAction } from '../../store/slices/appointmentSlice';
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
  Snackbar,
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
  
  // Access control - only Admin and Patient can access
  useBasicAccess();
  const [activeTab, setActiveTab] = useState(0);
  
  // Redux hooks
  const dispatch = useDispatch();
  const { 
    hasChanges, 
    isSaved, 
    isLoading: isSaving, 
    error: saveError, 
    photographConsent, 
    mounjaroConsent,
    semaglutideConsent,
    telehealthConsent,
    isLoaded, 
    isFetching,
    mounjaroHasChanges,
    mounjaroIsSaved,
    semaglutideHasChanges,
    semaglutideIsSaved,
    telehealthHasChanges,
    telehealthIsSaved
  } = useSelector((state) => state.consent);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [wasMounjaroSaved, setWasMounjaroSaved] = useState(false);
  const [isMounjaroFormComplete, setIsMounjaroFormComplete] = useState(false);
  const [wasSemaglutideSaved, setWasSemaglutideSaved] = useState(false);
  const [isSemaglutideFormComplete, setIsSemaglutideFormComplete] = useState(false);
  const [wasTelehealthSaved, setWasTelehealthSaved] = useState(false);
  const [isTelehealthFormComplete, setIsTelehealthFormComplete] = useState(false);

  // Consent forms state
  const [consentForms, setConsentForms] = useState({
    photographConsent: false,
    ozempicConsent: false,
    wegovyConsent: false,
    mounjaroConsent: false,
    semaglutideConsent: false,
    telemedicineConsent: false,
  });

  // Photograph consent specific state
  const [photographPermissions, setPhotographPermissions] = useState({
    educatePatients: null, // null = not answered, true = yes, false = no
    educateWebsite: null,
    educateSocialMedia: null,
  });

  const [photographSpecialRequests, setPhotographSpecialRequests] = useState('');
  
  // Patient information fields for Photograph Consent
  const [patientName, setPatientName] = useState('');
  const [patientDOB, setPatientDOB] = useState('');
  const [consentDate, setConsentDate] = useState('');

  const handleInsertTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setConsentDate(formattedDate);
  };

  // Patient information fields for Mounjaro Consent
  const [mounjaroPatientName, setMounjaroPatientName] = useState('');
  const [mounjaroPatientDOB, setMounjaroPatientDOB] = useState('');
  const [mounjaroConsentDate, setMounjaroConsentDate] = useState('');

  const handleInsertMounjaroTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setMounjaroConsentDate(formattedDate);
  };

  // Patient information fields for Semaglutide Consent
  const [semaglutidePatientName, setSemaglutidePatientName] = useState('');
  const [semaglutidePatientDOB, setSemaglutidePatientDOB] = useState('');
  const [semaglutideConsentDate, setSemaglutideConsentDate] = useState('');

  const handleInsertSemaglutideTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setSemaglutideConsentDate(formattedDate);
  };

  // Patient information fields for Telehealth Consent
  const [telehealthPatientName, setTelehealthPatientName] = useState('');
  const [telehealthPatientDOB, setTelehealthPatientDOB] = useState('');
  const [telehealthConsentDate, setTelehealthConsentDate] = useState('');

  const handleInsertTelehealthTodayDate = () => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setTelehealthConsentDate(formattedDate);
  };

  // Track signed date
  const [signedDates, setSignedDates] = useState({});

  // Signature pad state for Photograph Consent
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  
  // Signature pad state for Mounjaro Consent
  const mounjaroCanvasRef = useRef(null);
  const [mounjaroIsDrawing, setMounjaroIsDrawing] = useState(false);
  const [mounjaroSignatureData, setMounjaroSignatureData] = useState(null);
  
  // Signature pad state for Semaglutide Consent
  const semaglutideCanvasRef = useRef(null);
  const [semaglutideIsDrawing, setSemaglutideIsDrawing] = useState(false);
  const [semaglutideSignatureData, setSemaglutideSignatureData] = useState(null);
  
  // Signature pad state for Telehealth Consent
  const telehealthCanvasRef = useRef(null);
  const [telehealthIsDrawing, setTelehealthIsDrawing] = useState(false);
  const [telehealthSignatureData, setTelehealthSignatureData] = useState(null);
  
  // Track if we're loading data from store (to prevent marking as changed)
  const [isLoadingFromStore, setIsLoadingFromStore] = useState(false);

  // Initialize canvas
  const initCanvas = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  // Start drawing
  const startDrawing = (e, canvas) => {
    if (!canvas) return;
    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Draw
  const draw = (e, canvas) => {
    if (!isDrawing || !canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Stop drawing
  const stopDrawing = (canvas) => {
    if (!canvas) return;
    setIsDrawing(false);
    const ctx = canvas.getContext('2d');
    ctx.closePath();
    // Save signature data
    setSignatureData(canvas.toDataURL());
    markPhotographConsentChanged();
  };

  // Clear signature
  const clearSignature = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  // Track window size for responsive tabs
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Fetch all consent forms on mount
  useEffect(() => {
    if (mounted && user) {
      console.log('Fetching photograph consent for user...');
      dispatch(fetchPhotographConsent());
      console.log('Fetching mounjaro consent for user...');
      dispatch(fetchMounjaroConsent());
      console.log('Fetching semaglutide consent for user...');
      dispatch(fetchSemaglutideConsent());
      console.log('Fetching telehealth consent for user...');
      dispatch(fetchTelehealthConsent());
    }
  }, [mounted, user, dispatch]);

  // Populate form fields from store when data is loaded
  useEffect(() => {
    if (isLoaded && photographConsent) {
      console.log('📋 Loading photograph consent data into form:', photographConsent);
      const data = photographConsent;
      
      // Set loading flag to prevent marking as changed
      setIsLoadingFromStore(true);
      
      // Check if form is already complete
      if (data.complete === true) {
        console.log('🔒 Form is marked as complete - locking fields');
        setIsFormComplete(true);
        setConsentForms(prev => ({
          ...prev,
          photographConsent: true
        }));
      }
      
      // Set patient information
      if (data.patientName) {
        console.log('Setting patient name:', data.patientName);
        setPatientName(data.patientName);
      }
      if (data.patientDOB) {
        console.log('Setting patient DOB:', data.patientDOB);
        setPatientDOB(data.patientDOB);
      }
      if (data.consentDate) {
        console.log('Setting consent date:', data.consentDate);
        setConsentDate(data.consentDate);
      }
      
      // Set permissions
      if (data.permissions) {
        console.log('Setting permissions:', data.permissions);
        setPhotographPermissions({
          educatePatients: data.permissions.educatePatients ?? null,
          educateWebsite: data.permissions.educateWebsite ?? null,
          educateSocialMedia: data.permissions.educateSocialMedia ?? null,
        });
      }
      
      // Set special requests
      if (data.specialRequests) {
        console.log('Setting special requests:', data.specialRequests);
        setPhotographSpecialRequests(data.specialRequests);
      }
      
      // Set signature if available
      if (data.signature) {
        console.log('Setting signature data');
        setSignatureData(data.signature);
      }
      
      console.log('✅ Form populated with saved data');
      
      // Reset loading flag after a short delay to allow all state updates
      setTimeout(() => {
        setIsLoadingFromStore(false);
      }, 100);
    } else {
      console.log('⚠️ Not loading data. isLoaded:', isLoaded, 'photographConsent:', photographConsent);
    }
  }, [isLoaded, photographConsent]);

  // Draw photograph signature on canvas when signature data and canvas are both available
  useEffect(() => {
    if (signatureData && canvasRef.current) {
      console.log('🖊️ Drawing photograph signature on canvas');
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        console.log('✅ Photograph signature drawn successfully');
      };
      img.onerror = () => {
        console.error('❌ Failed to load photograph signature image');
      };
      img.src = signatureData;
    }
  }, [signatureData, activeTab]); // Re-run when switching tabs to ensure canvas is ready

  // Populate Mounjaro form fields from store when data is loaded
  useEffect(() => {
    if (isLoaded && mounjaroConsent) {
      console.log('📋 Loading mounjaro consent data into form:', mounjaroConsent);
      const data = mounjaroConsent;
      
      // Check if form is already complete
      if (data.complete === true) {
        console.log('🔒 Mounjaro form is marked as complete - locking fields');
        setIsMounjaroFormComplete(true);
        setConsentForms(prev => ({
          ...prev,
          mounjaroConsent: true
        }));
      }
      
      // Set patient information
      if (data.patientName) {
        console.log('Setting mounjaro patient name:', data.patientName);
        setMounjaroPatientName(data.patientName);
      }
      if (data.patientDOB) {
        console.log('Setting mounjaro patient DOB:', data.patientDOB);
        setMounjaroPatientDOB(data.patientDOB);
      }
      if (data.consentDate) {
        console.log('Setting mounjaro consent date:', data.consentDate);
        setMounjaroConsentDate(data.consentDate);
      }
      
      // Set signature if available
      if (data.signature) {
        console.log('Setting mounjaro signature data');
        setMounjaroSignatureData(data.signature);
      }
      
      console.log('✅ Mounjaro form populated with saved data');
    } else {
      console.log('⚠️ Not loading mounjaro data. isLoaded:', isLoaded, 'mounjaroConsent:', mounjaroConsent);
    }
  }, [isLoaded, mounjaroConsent]);

  // Draw mounjaro signature on canvas when signature data and canvas are both available
  useEffect(() => {
    if (mounjaroSignatureData && mounjaroCanvasRef.current) {
      console.log('🖊️ Drawing mounjaro signature on canvas');
      const canvas = mounjaroCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        console.log('✅ Mounjaro signature drawn successfully');
      };
      img.onerror = () => {
        console.error('❌ Failed to load mounjaro signature image');
      };
      img.src = mounjaroSignatureData;
    }
  }, [mounjaroSignatureData, activeTab]); // Re-run when switching tabs to ensure canvas is ready

  // Populate Semaglutide form fields from store when data is loaded
  useEffect(() => {
    if (isLoaded && semaglutideConsent) {
      console.log('📋 Loading semaglutide consent data into form:', semaglutideConsent);
      const data = semaglutideConsent;
      
      // Check if form is already complete
      if (data.complete === true) {
        console.log('🔒 Semaglutide form is marked as complete - locking fields');
        setIsSemaglutideFormComplete(true);
        setConsentForms(prev => ({
          ...prev,
          semaglutideConsent: true
        }));
      }
      
      // Set patient information
      if (data.patientName) {
        setSemaglutidePatientName(data.patientName);
      }
      if (data.patientDOB) {
        setSemaglutidePatientDOB(data.patientDOB);
      }
      if (data.consentDate) {
        setSemaglutideConsentDate(data.consentDate);
      }
      
      // Set signature if available
      if (data.signature) {
        setSemaglutideSignatureData(data.signature);
      }
      
      console.log('✅ Semaglutide form populated with saved data');
    }
  }, [isLoaded, semaglutideConsent]);

  // Draw semaglutide signature on canvas when signature data and canvas are both available
  useEffect(() => {
    if (semaglutideSignatureData && semaglutideCanvasRef.current) {
      const canvas = semaglutideCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.onerror = () => {
        console.error('❌ Failed to load semaglutide signature image');
      };
      img.src = semaglutideSignatureData;
    }
  }, [semaglutideSignatureData, activeTab]);

  // Populate Telehealth form fields from store when data is loaded
  useEffect(() => {
    if (isLoaded && telehealthConsent) {
      console.log('📋 Loading telehealth consent data into form:', telehealthConsent);
      const data = telehealthConsent;
      
      // Check if form is already complete
      if (data.complete === true) {
        console.log('🔒 Telehealth form is marked as complete - locking fields');
        setIsTelehealthFormComplete(true);
        setConsentForms(prev => ({
          ...prev,
          telemedicineConsent: true
        }));
      }
      
      // Set patient information
      if (data.patientName) {
        console.log('Setting telehealth patient name:', data.patientName);
        setTelehealthPatientName(data.patientName);
      }
      if (data.patientDOB) {
        console.log('Setting telehealth patient DOB:', data.patientDOB);
        setTelehealthPatientDOB(data.patientDOB);
      }
      if (data.consentDate) {
        console.log('Setting telehealth consent date:', data.consentDate);
        setTelehealthConsentDate(data.consentDate);
      }
      
      // Set signature if available
      if (data.signature) {
        console.log('Setting telehealth signature data');
        setTelehealthSignatureData(data.signature);
      }
      
      console.log('✅ Telehealth form populated with saved data');
    } else {
      console.log('⚠️ Not loading telehealth data. isLoaded:', isLoaded, 'telehealthConsent:', telehealthConsent);
    }
  }, [isLoaded, telehealthConsent]);

  // Draw telehealth signature on canvas when signature data and canvas are both available
  useEffect(() => {
    if (telehealthSignatureData && telehealthCanvasRef.current) {
      console.log('🖊️ Drawing telehealth signature on canvas');
      const canvas = telehealthCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        console.log('✅ Telehealth signature drawn successfully');
      };
      img.onerror = () => {
        console.error('❌ Failed to load telehealth signature image');
      };
      img.src = telehealthSignatureData;
    }
  }, [telehealthSignatureData, activeTab]); // Re-run when switching tabs to ensure canvas is ready

  // Show snackbar when photograph consent is saved
  useEffect(() => {
    if (isSaved) {
      setSnackbarOpen(true);
      dispatch(resetConsentSaveFlag());
      
      // Reset wasCompleted flag after showing message
      if (wasCompleted) {
        setTimeout(() => {
          setWasCompleted(false);
        }, 3000);
      }
    }
  }, [isSaved, dispatch, wasCompleted]);

  // Show snackbar when mounjaro consent is saved
  useEffect(() => {
    if (mounjaroIsSaved) {
      setWasMounjaroSaved(true);
      setSnackbarOpen(true);
      dispatch(resetMounjaroConsentSaveFlag());
      
      // Reset flag after showing message
      setTimeout(() => {
        setWasMounjaroSaved(false);
      }, 3000);
    }
  }, [mounjaroIsSaved, dispatch]);

  // Show snackbar when semaglutide consent is saved
  useEffect(() => {
    if (semaglutideIsSaved) {
      setWasSemaglutideSaved(true);
      setSnackbarOpen(true);
      dispatch(resetSemaglutideConsentSaveFlag());
      
      setTimeout(() => {
        setWasSemaglutideSaved(false);
      }, 3000);
    }
  }, [semaglutideIsSaved, dispatch]);

  // Show snackbar when telehealth consent is saved
  useEffect(() => {
    if (telehealthIsSaved) {
      setWasTelehealthSaved(true);
      setSnackbarOpen(true);
      dispatch(resetTelehealthConsentSaveFlag());
      
      // Reset flag after showing message
      setTimeout(() => {
        setWasTelehealthSaved(false);
      }, 3000);
    }
  }, [telehealthIsSaved, dispatch]);

  // Mark changes when photograph consent fields change
  const markPhotographConsentChanged = () => {
    // Don't mark as changed if we're loading from store
    if (!isLoadingFromStore) {
      dispatch(setConsentChanges(true));
    }
  };

  // Mark changes when mounjaro consent fields change
  const markMounjaroConsentChanged = () => {
    dispatch(setMounjaroConsentChanges(true));
  };

  // Mark changes when semaglutide consent fields change
  const markSemaglutideConsentChanged = () => {
    dispatch(setSemaglutideConsentChanges(true));
  };

  // Mark changes when telehealth consent fields change
  const markTelehealthConsentChanged = () => {
    dispatch(setTelehealthConsentChanges(true));
  };

  // Check if photograph consent form is complete
  const isPhotographConsentComplete = () => {
    const isComplete = 
      consentForms['photographConsent'] === true && // Checkbox checked
      patientName.trim() !== '' && // Name entered
      patientDOB !== '' && // DOB entered
      consentDate !== '' && // Date entered
      signatureData !== null; // Signature present
    
    return isComplete;
  };

  // Check if mounjaro consent form is complete
  const isMounjaroConsentComplete = () => {
    const isComplete = 
      consentForms['mounjaroConsent'] === true && // Checkbox checked
      mounjaroPatientName.trim() !== '' && // Name entered
      mounjaroPatientDOB !== '' && // DOB entered
      mounjaroConsentDate !== '' && // Date entered
      mounjaroSignatureData !== null; // Signature present
    
    return isComplete;
  };

  // Check if semaglutide consent form is complete
  const isSemaglutideConsentComplete = () => {
    return (
      consentForms['semaglutideConsent'] === true &&
      semaglutidePatientName.trim() !== '' &&
      semaglutidePatientDOB !== '' &&
      semaglutideConsentDate !== '' &&
      semaglutideSignatureData !== null
    );
  };

  // Check if telehealth consent form is complete
  const isTelehealthConsentComplete = () => {
    const checkboxChecked = consentForms['telemedicineConsent'] === true;
    const nameEntered = telehealthPatientName.trim() !== '';
    const dobEntered = telehealthPatientDOB !== '';
    const dateEntered = telehealthConsentDate !== '';
    const signaturePresent = telehealthSignatureData !== null;
    
    console.log('Telehealth Consent Completion Status:', {
      checkboxChecked,
      nameEntered,
      dobEntered,
      dateEntered,
      signaturePresent,
      telehealthPatientName,
      telehealthPatientDOB,
      telehealthConsentDate,
      hasSignature: telehealthSignatureData !== null
    });
    
    const isComplete = checkboxChecked && nameEntered && dobEntered && dateEntered && signaturePresent;
    
    return isComplete;
  };

  // Handle saving photograph consent
  const handleSavePhotographConsent = (markAsComplete = false) => {
    const consentData = {
      patientName,
      patientDOB,
      consentDate,
      signature: signatureData,
      permissions: photographPermissions,
      specialRequests: photographSpecialRequests,
      complete: markAsComplete, // Mark as complete if requested
    };
    
    console.log('Saving photograph consent:', consentData, 'Complete:', markAsComplete);
    dispatch(savePhotographConsent(consentData));
  };

  // Handle completing photograph consent
  const handleCompletePhotographConsent = () => {
    if (isPhotographConsentComplete()) {
      console.log('Completing photograph consent form...');
      setWasCompleted(true);
      handleSavePhotographConsent(true); // Save with complete: true
      
      // Navigate to next tab after a short delay to allow save to complete
      setTimeout(() => {
        setActiveTab(Math.min(forms.length - 1, activeTab + 1));
      }, 500);
    }
  };

  // Handle saving mounjaro consent
  const handleSaveMounjaroConsent = (markAsComplete = false) => {
    const consentData = {
      patientName: mounjaroPatientName,
      patientDOB: mounjaroPatientDOB,
      consentDate: mounjaroConsentDate,
      signature: mounjaroSignatureData,
      complete: markAsComplete,
    };
    
    console.log('Saving mounjaro consent:', consentData, 'Complete:', markAsComplete);
    dispatch(saveMounjaroConsent(consentData));
  };

  // Handle completing mounjaro consent
  const handleCompleteMounjaroConsent = () => {
    if (isMounjaroConsentComplete()) {
      console.log('Completing mounjaro consent form...');
      handleSaveMounjaroConsent(true);
      
      setTimeout(() => {
        setActiveTab(Math.min(forms.length - 1, activeTab + 1));
      }, 500);
    }
  };

  // Handle saving semaglutide consent
  const handleSaveSemaglutideConsent = (markAsComplete = false) => {
    const consentData = {
      patientName: semaglutidePatientName,
      patientDOB: semaglutidePatientDOB,
      consentDate: semaglutideConsentDate,
      signature: semaglutideSignatureData,
      complete: markAsComplete,
    };
    
    console.log('Saving semaglutide consent:', consentData, 'Complete:', markAsComplete);
    dispatch(saveSemaglutideConsent(consentData));
  };

  // Handle completing semaglutide consent
  const handleCompleteSemaglutideConsent = () => {
    if (isSemaglutideConsentComplete()) {
      console.log('Completing semaglutide consent form...');
      handleSaveSemaglutideConsent(true);
      
      setTimeout(() => {
        setActiveTab(Math.min(forms.length - 1, activeTab + 1));
      }, 500);
    }
  };

  // Handle saving telehealth consent
  const handleSaveTelehealthConsent = (markAsComplete = false) => {
    const consentData = {
      patientName: telehealthPatientName,
      patientDOB: telehealthPatientDOB,
      consentDate: telehealthConsentDate,
      signature: telehealthSignatureData,
      complete: markAsComplete,
    };
    
    console.log('Saving telehealth consent:', consentData, 'Complete:', markAsComplete);
    dispatch(saveTelehealthConsent(consentData));
  };

  // Handle completing telehealth consent
  const handleCompleteTelehealthConsent = () => {
    if (isTelehealthConsentComplete()) {
      console.log('Completing telehealth consent form...');
      handleSaveTelehealthConsent(true); // Save with complete: true
      
      // Navigate to next tab after a short delay to allow save to complete
      setTimeout(() => {
        setActiveTab(Math.min(forms.length - 1, activeTab + 1));
      }, 500);
    }
  };

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

    // Mark Mounjaro consent as changed if it's the mounjaro form
    if (formName === 'mounjaroConsent') {
      markMounjaroConsentChanged();
    }
    
    // Mark Semaglutide consent as changed if it's the semaglutide form
    if (formName === 'semaglutideConsent') {
      markSemaglutideConsentChanged();
    }
    
    // Mark Telehealth consent as changed if it's the telehealth form
    if (formName === 'telemedicineConsent') {
      markTelehealthConsentChanged();
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
      date: consentDate,
      signature: signatureData
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
        
        /* Page break before declaration */
        .print-page-break {
          page-break-before: always !important;
          break-before: page !important;
        }
        
        /* Remove height restrictions and scrolling for form content */
        #printable-content-${formName} .MuiPaper-root {
          max-height: none !important;
          height: auto !important;
          overflow: visible !important;
        }
        
        /* Ensure all text is visible */
        #printable-content-${formName} p,
        #printable-content-${formName} .MuiTypography-root {
          white-space: pre-wrap !important;
          overflow: visible !important;
        }
        
        /* Display patient name and DOB side by side when printing */
        #printable-content-${formName} .patient-info-grid {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: wrap !important;
        }
        
        #printable-content-${formName} .patient-info-grid > div {
          flex: 0 0 50% !important;
          max-width: 50% !important;
          padding-right: 12px !important;
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

  // Get consent data from Redux store
  const photographConsentData = useSelector(state => state.consent.photographConsent);
  const mounjaroConsentData = useSelector(state => state.consent.mounjaroConsent);
  const semaglutideConsentData = useSelector(state => state.consent.semaglutideConsent);
  const telehealthConsentData = useSelector(state => state.consent.telehealthConsent);

  // Define all possible consent forms
  const allForms = [
    {
      id: 'photographConsent',
      title: 'Photograph Consent',
      description: 'Consent for use of Photographs',
      hasCustomFields: true,
      content: `Before and after photographs are important proofs of the success of your program. Many patients who are contemplating whether a weight loss program might be right for them find photographs useful. Images, including before and after photos, may be used for patient education and for advertising.

Svelte by LuKaria will only use your photographs if you have given permission to do so. Names are not used, and identifying factors are masked when requested. These photos are stored in a secure server in compliance with Jamaica's Data Protection Act. They will be accessed by clinic staff and will not be sold or transferred to any other entity for purposes that have not been agreed to.`,
    },
    {
      id: 'mounjaroConsent',
      title: 'Mounjaro Consent',
      description: 'Consent for Mounjaro (tirzepatide) treatment',
      hasCustomFields: true,
      content: `Purpose of Treatment:
Mounjaro is a human-based glucagon-like peptide-1 receptor agonist and Glucose Dependent Insulinotropic Polypeptide (GIP) receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.

Mounjaro is FDA approved for the management of Type 2 Diabetes, and is used off label for weight management in non-diabetic patients who are overweight or obese. It works by increasing insulin production and lowers glucagon secretion as well as targets areas in the brain that regulate appetite and food intake. Mounjaro also assists the body to store fat more efficiently.

Do not take Mounjaro if:
• You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)
• Multiple Endocrine Neoplasia syndrome type 2
• You are pregnant or plan to become pregnant while taking this medicine
• You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist. Specifically, if you are prescribed Insulin because the combination may increase your risk of hypoglycemia (low blood sugar) and dosage adjustments by your provider may be necessary
• You have a history of Pancreatitis
• You are allergic to BPC-157, Tirzepatide or any other GLP-1 agonist such as: Adlyxin®, Byeta®, Bydureon®, Ozempic®, Rybelsus®, Trulicity®, Victoza®, Wegovy®

Possible Drug Interactions:
Anti-diabetic agents, specifically: Insulin and Sulfonylureas (e.g., glyburide, glipizide, glimepiride, tolbutamide) due to the increased risk of hypoglycemia (low blood sugar). Do not take with other GLP-1 agonist medicines such as: Adlyxin®, Byeta®, Bydureon®, Ozempic®, Rybelsus®,Trulicity®, Victoza®, Wegovy® (THIS IS NOT AN ALL-INCLUSIVE LIST). Please tell your provider about any medications that may lower your blood sugar.

Side Effects:
I understand that, like all medications, Mounjaro may cause side effects. These may include but are not limited to:
• Nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
• Subcutaneous Injections: common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin(welting)
• Serious side effects: Pancreatitis, Cholecystitis, kidney problems, changes in vision (Diabetic retinopathy and NAION), low blood sugar (hypoglycemia), gastroparesis

A very serious allergic reaction to this drug is rare. However, get medical help right away if you notice any symptoms of a serious allergic reaction, including rash, itching/swelling (especially of the face/tongue/throat), severe dizziness, trouble breathing. Report adverse side effects to your doctor.

Precautions:
• In rodents, another GLP1 receptor agonist causes dose-dependent and treatment-duration dependent thyroid C-cell tumors at clinically relevant exposures. It is unknown whether Tirzepatide causes thyroid C-cell tumors, including medullary thyroid carcinoma (MTC), in humans.
• Acute pancreatitis, including fatal and non-fatal hemorrhagic or necrotizing pancreatitis, has been observed in patients treated with GLP-1 receptor agonists, including Tirzepatide.
• Acute Gallbladder Disease: Treatment with Tirzepatide is associated with an increased occurrence of cholelithiasis and cholecystitis.
• Acute Kidney Injury: There have been reports of acute kidney injury and worsening of chronic renal failure, which in some cases required hemodialysis, in patients treated with Tirzepatide.
• Heart Rate Increase: Mean increases in resting heart rate of 1 to 4 beats per minute (bpm) were observed in Tirzepatide adult patients compared to placebo in clinical trials.

Monitoring and Follow-up:
I agree to undergo regular monitoring as recommended by my healthcare provider, which may include:
• Blood sugar levels and HbA1c testing
• Kidney function tests
• Liver function tests
• Thyroid function tests
• Pregnancy testing
• Follow-up visits to evaluate the effectiveness and adjust the treatment plan if necessary

Alternatives to Mounjaro:
I have been informed of alternative treatment options, which may include lifestyle changes (such as diet and exercise), other medications for type 2 diabetes or weight management, and surgical options for weight loss.

Consent:
By signing below, I certify that I have read and understand the contents of this form. I acknowledge that:
• I consent to initiating/continuing treatment with Mounjaro
• I have had the opportunity to ask questions about Mounjaro and its potential risks and benefits.
• I have a proper laboratory testing done prior to starting treatment
• I am aware of the possible side effects and drug interactions and give my consent for treatment
• I have informed the medical staff of any known allergies to drugs or other substances, and any past adverse reactions I've experienced. I have informed the medical staff of all medications and supplements I'm currently taking
• I understand there are other ways and programs that can assist me in my desire to decrease my body weight and acknowledge that no guarantees have been made to me concerning my results.`,
    },
    {
      id: 'semaglutideConsent',
      title: 'Semaglutide Consent',
      description: 'Consent for Semaglutide treatment',
      hasCustomFields: true,
      content: `Purpose of Treatment:
Semaglutide is a human-based glucagon-like peptide-1 receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
Semaglutide is FDA approved for the management of Type 2 Diabetes, and is used off label for weight management in non-diabetic patients who are overweight or obese. These medicines work by slowing gastric emptying time and stimulating the satiety center in the brain to reduce hunger and appetite.

Do not take Semaglutide if:
• You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)
• Multiple Endocrine Neoplasia syndrome type 2
• You are pregnant or plan to become pregnant while taking this medicine
• You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist. Specifically, if you are prescribed Insulin because the combination may increase your risk of hypoglycemia (low blood sugar) and dosage adjustments by your provider may be necessary
• You have a history of Pancreatitis
• You are allergic to Semaglutide or any other GLP-1 agonist such as: Adlyxin®, Byeta®, Bydureon®, Mounjaro®, Ozempic®, Rybelsus®, Trulicity®, Victoza®, Wegovy®

Possible Drug Interactions:
Anti-diabetic agents, specifically: Insulin and Sulfonylureas (e.g., glyburide, glipizide, glimepiride, tolbutamide) due to the increased risk of hypoglycemia (low blood sugar). Do not take with other GLP-1 agonist medicines such as: Adlyxin®, Byeta®, Bydureon®, Rybelsus®,Trulicity®, Victoza®, or Wegovy® (THIS IS NOT AN ALL-INCLUSIVE LIST). Please tell your provider about any medications that may lower your blood sugar.

Side Effects:
I understand that, like all medications, Semaglutide may cause side effects. These may include but are not limited to:
• Nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
• Subcutaneous Injections: common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin (welting)
• Serious side effects: Pancreatitis, Cholecystitis, kidney problems, changes in vision (Diabetic retinopathy and NAION), low blood sugar (hypoglycemia), gastroparesis

A very serious allergic reaction to this drug is rare. However, get medical help right away if you notice any symptoms of a serious allergic reaction, including rash, itching/swelling (especially of the face/tongue/throat), severe dizziness, trouble breathing. Report adverse side effects to your doctor.

Precautions:
• In rodents, GLP-1 receptor agonists cause dose-dependent and treatment-duration dependent thyroid C-cell tumors at clinically relevant exposures. It is unknown whether Semaglutide causes thyroid C-cell tumors, including medullary thyroid carcinoma (MTC), in humans.
• Acute pancreatitis, including fatal and non-fatal hemorrhagic or necrotizing pancreatitis, has been observed in patients treated with GLP-1 receptor agonists, including Semaglutide.
• Acute Gallbladder Disease: Treatment with Semaglutide is associated with an increased occurrence of cholelithiasis and cholecystitis.
• Acute Kidney Injury: There have been reports of acute kidney injury and worsening of chronic renal failure, which in some cases required hemodialysis, in patients treated with Semaglutide.
• Heart Rate Increase: Mean increases in resting heart rate have been observed in Semaglutide patients compared to placebo in clinical trials.

Monitoring and Follow-up:
I agree to undergo regular monitoring as recommended by my healthcare provider, which may include:
• Blood sugar levels and HbA1c testing
• Kidney function tests
• Liver function tests
• Thyroid function tests
• Pregnancy testing
• Follow-up visits to evaluate the effectiveness and adjust the treatment plan if necessary

Alternatives to Semaglutide:
I have been informed of alternative treatment options, which may include lifestyle changes (such as diet and exercise), other medications for type 2 diabetes or weight management, and surgical options for weight loss.

Consent:
By signing below, I certify that I have read and understand the contents of this form. I acknowledge that:
• I consent to initiating/continuing treatment with Semaglutide
• I have had the opportunity to ask questions about Semaglutide and its potential risks and benefits.
• I have a proper laboratory testing done prior to starting treatment
• I am aware of the possible side effects and drug interactions and give my consent for treatment
• I have informed the medical staff of any known allergies to drugs or other substances, and any past adverse reactions I've experienced. I have informed the medical staff of all medications and supplements I'm currently taking
• I understand there are other ways and programs that can assist me in my desire to decrease my body weight and acknowledge that no guarantees have been made to me concerning my results.`,
    },
    {
      id: 'telemedicineConsent',
      title: 'Telehealth Consent',
      description: 'Consent for telehealth services',
      hasCustomFields: true,
      content: `I understand that my healthcare provider wishes me to engage in a telehealth appointment.

I understand that the video conferencing technology that will be used to affect such an appointment will not be the same as a direct client/health care provider visit due to the fact that I will not be in the same room as my provider.

I understand that a telehealth consultation has potential benefits including easier access to care and the convenience of meeting from a location of my choosing.

I understand there are potential risks to this technology, including interruptions, unauthorized access, and technical difficulties. I understand that my health care provider or I can discontinue the telehealth consult/visit if it is felt that the videoconferencing connections are not adequate for the situation.

Consent to Use Telehealth Services by Carepatron:
Telehealth by Carepatron is the technology service we will use to conduct telehealth videoconferencing appointments. It is simple to use and there are no passwords required to log in. By signing this document, I acknowledge:

• Telehealth by Carepatron is NOT an Emergency Service and in the event of an emergency, I will use a phone to call your local emergency telephone number.

• Though my provider and I may be in direct, virtual contact through the Telehealth Service, neither Carepatron nor the Telehealth Service provides any medical or healthcare services or advice including, but not limited to, emergency or urgent medical services.

• The Telehealth Services by Carepatron facilitates videoconferencing and is not responsible for the delivery of any healthcare, medical advice or care.

• I do not assume that my provider has access to any or all of the technical information in the Telehealth by Carepatron – or that such information is current, accurate or up-to-date. I will not rely on my health care provider to have any of this information in the Telehealth by Carepatron.

• To maintain confidentiality, I will not share my telehealth appointment link with anyone unauthorized to attend the appointment.`,
    },
  ];

  // Filter forms based on availability in Redux store
  const forms = allForms.filter(form => {
    switch (form.id) {
      case 'photographConsent':
        return photographConsentData?.available === true;
      case 'mounjaroConsent':
        return mounjaroConsentData?.available === true;
      case 'semaglutideConsent':
        return semaglutideConsentData?.available === true;
      case 'telemedicineConsent':
        return telehealthConsentData?.available === true;
      default:
        return false;
    }
  });

  // Ensure activeTab is within valid range
  useEffect(() => {
    if (activeTab >= forms.length || activeTab < 0) {
      console.log('⚠️ Active tab out of bounds, resetting to 0. Current activeTab:', activeTab, 'forms.length:', forms.length);
      setActiveTab(0);
    }
  }, [activeTab, forms.length]);

  // Additional safety check when forms change
  useEffect(() => {
    if (forms.length > 0 && (activeTab >= forms.length || activeTab < 0)) {
      console.log('⚠️ Forms changed, resetting activeTab to 0. Current activeTab:', activeTab, 'forms.length:', forms.length);
      setActiveTab(0);
    }
  }, [forms.length]);

  // Reset activeTab when forms are filtered and activeTab becomes invalid
  useEffect(() => {
    if (forms.length === 0) {
      console.log('⚠️ No forms available, resetting activeTab to 0');
      setActiveTab(0);
    } else if (activeTab >= forms.length) {
      console.log('⚠️ ActiveTab exceeds available forms, resetting to 0');
      setActiveTab(0);
    }
  }, [forms, activeTab]);

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

  // Show message if no forms are available
  if (forms.length === 0) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
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
                  Consent Forms
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  No consent forms are currently available for your account.
                </Typography>
              </Box>
            </Box>
          </Paper>
          <Alert severity="info">
            No consent forms are currently available. Please contact your healthcare provider if you believe this is an error.
          </Alert>
        </Container>
      </>
    );
  }

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
          Please review each consent form carefully. Use the tabs to navigate between forms. 
          Check the box on each tab when you complete the form.
        </Alert>

        {/* Responsive Tabs Layout */}
        <Box sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: 600 }}>
          {/* Tabs - Horizontal scrollable on mobile, Vertical standard on desktop */}
          <Tabs
            orientation={isMobile ? 'horizontal' : 'vertical'}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            allowScrollButtonsMobile
            value={Math.max(0, Math.min(activeTab, forms.length - 1))}
            onChange={handleTabChange}
            sx={{
              borderRight: { xs: 0, md: 1 },
              borderBottom: { xs: 1, md: 0 },
              borderColor: 'divider',
              minWidth: { xs: '100%', md: 280 },
              maxWidth: { xs: '100%', md: 280 },
              '& .MuiTab-root': {
                alignItems: { xs: 'center', md: 'flex-start' },
                textAlign: { xs: 'center', md: 'left' },
                py: 2,
                px: 2,
                minHeight: { xs: 48, md: 'auto' },
              },
              '& .MuiTabs-scroller': {
                overflowX: { xs: 'auto !important', md: 'hidden !important' },
                overflowY: 'visible',
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
                        textAlign: { xs: 'center', md: 'left' },
                        flex: 1,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      {form.title}
                    </Typography>
                    {consentForms[form.id] && (
                      <CheckCircle 
                        sx={{ 
                          color: 'success.main',
                          fontSize: { xs: '1rem', md: '1.2rem' }
                        }} 
                      />
                    )}
                  </Box>
                }
                sx={{
                  borderLeft: { xs: 0, md: activeTab === index ? 3 : 0 },
                  borderBottom: { xs: activeTab === index ? 3 : 0, md: 0 },
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
          <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
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
                      {(form.id === 'mounjaroConsent' || form.id === 'semaglutideConsent') ? (
                        <>
                          {(() => {
                            // Split content at page break points
                            let sections = [];
                            let content = form.content;
                            
                            // Split at "Side Effects:"
                            const sideEffectsSplit = content.split('Side Effects:');
                            
                            if (sideEffectsSplit.length > 1) {
                              // Further split at "Monitoring and Follow-up:"
                              const monitoringSplit = sideEffectsSplit[1].split('Monitoring and Follow-up:');
                              
                              if (monitoringSplit.length > 1) {
                                // Further split at "Consent:"
                                const consentSplit = monitoringSplit[1].split('Consent:');
                                
                                sections = [
                                  { text: sideEffectsSplit[0], pageBreak: false },
                                  { text: 'Side Effects:' + monitoringSplit[0], pageBreak: true },
                                  { text: 'Monitoring and Follow-up:' + consentSplit[0], pageBreak: true },
                                  { text: 'Consent:' + (consentSplit[1] || ''), pageBreak: true }
                                ];
                              } else {
                                sections = [
                                  { text: sideEffectsSplit[0], pageBreak: false },
                                  { text: 'Side Effects:' + monitoringSplit[0], pageBreak: true }
                                ];
                              }
                            } else {
                              sections = [{ text: content, pageBreak: false }];
                            }
                            
                            return sections.map((section, index) => (
                              <Typography 
                                key={index} 
                                variant="body1" 
                                paragraph 
                                sx={{ whiteSpace: 'pre-line' }}
                                className={section.pageBreak ? 'print-page-break' : ''}
                              >
                                {section.text}
                              </Typography>
                            ));
                          })()}
                        </>
                      ) : (
                      <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                        {form.content}
                      </Typography>
                      )}
                    </Paper>

                    {/* Custom Fields for Photograph Consent and Mounjaro Consent */}
                    {form.hasCustomFields && (
                      <>
                        {/* Form Complete Notice - Only for Photograph Consent */}
                        {isFormComplete && form.id === 'photographConsent' && (
                          <Alert severity="info" icon={<CheckCircle />} sx={{ mb: 3 }}>
                            <strong>This form has been completed and locked.</strong> No further edits can be made.
                          </Alert>
                        )}

                        {/* Patient Information Section */}
                       
                        {/* Photography Usage Permissions Section - Only for Photograph Consent */}
                        {form.id === 'photographConsent' && (
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
                                onChange={(e) => {
                                  setPhotographPermissions(prev => ({
                                  ...prev,
                                  educatePatients: e.target.value === 'yes'
                                  }));
                                  markPhotographConsentChanged();
                                }}
                              >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {/* Question 2 */}
                          <Grid item xs={12}>
                            <FormControl component="fieldset" disabled={isFormComplete}>
                              <FormLabel component="legend" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                To educate patients on our website
                              </FormLabel>
                              <RadioGroup
                                row
                                value={photographPermissions.educateWebsite === null ? '' : photographPermissions.educateWebsite ? 'yes' : 'no'}
                                onChange={(e) => {
                                  setPhotographPermissions(prev => ({
                                  ...prev,
                                  educateWebsite: e.target.value === 'yes'
                                  }));
                                  markPhotographConsentChanged();
                                }}
                              >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {/* Question 3 */}
                          <Grid item xs={12}>
                            <FormControl component="fieldset" disabled={isFormComplete}>
                              <FormLabel component="legend" sx={{ fontWeight: 500, color: 'text.primary', mb: 1 }}>
                                To educate patients on our social media accounts
                              </FormLabel>
                              <RadioGroup
                                row
                                value={photographPermissions.educateSocialMedia === null ? '' : photographPermissions.educateSocialMedia ? 'yes' : 'no'}
                                onChange={(e) => {
                                  setPhotographPermissions(prev => ({
                                  ...prev,
                                  educateSocialMedia: e.target.value === 'yes'
                                  }));
                                  markPhotographConsentChanged();
                                }}
                              >
                                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                                <FormControlLabel value="no" control={<Radio />} label="No" />
                              </RadioGroup>
                            </FormControl>
                          </Grid>

                          {/* Special Requests */}
                          <Grid item xs={12}>
                            <FormLabel component="legend" sx={{ fontWeight: 500, color: 'text.primary', mb: 1, display: 'block' }}>
                              If you have checked 'Yes' to any of the above and have any special requests with regards to how your photos are displayed or used, please list them below:
                            </FormLabel>
                            <TextField
                              fullWidth
                              multiline
                              rows={4}
                              value={photographSpecialRequests}
                              onChange={(e) => {
                                setPhotographSpecialRequests(e.target.value);
                                markPhotographConsentChanged();
                              }}
                              placeholder="Enter any special requests here..."
                              disabled={isFormComplete}
                            />
                          </Grid>

                          </Grid>
                        </Card>
                        )}

                      {/* Consent Checkbox for Photograph - Above Patient Card */}
                      {form.id === 'photographConsent' && (
                        <Card 
                          elevation={2}
                          sx={{
                            p: 2,
                            backgroundColor: consentForms[form.id] ? 'success.light' : 'background.paper',
                            border: '2px solid',
                            borderColor: consentForms[form.id] ? 'success.main' : 'divider',
                            mb: 3,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={consentForms[form.id]}
                                    onChange={() => handleConsentChange(form.id)}
                                    color="success"
                                  disabled={isFormComplete}
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
                        </Card>
                      )}

                      {/* Patient Information Card - Photograph Consent */}
                      {form.id === 'photographConsent' && (
                      <Card elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={3} className="patient-info-grid">
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Patient's Name as appears on ID"
                              value={patientName}
                              onChange={(e) => {
                                setPatientName(e.target.value);
                                markPhotographConsentChanged();
                              }}
                              placeholder="Enter patient's full name"
                              disabled={isFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Patient's Date of Birth"
                              value={patientDOB}
                              onChange={(e) => {
                                setPatientDOB(e.target.value);
                                markPhotographConsentChanged();
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                max: "9999-12-31",
                                min: "1900-01-01"
                              }}
                              disabled={isFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                              <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={consentDate}
                                onChange={(e) => {
                                  setConsentDate(e.target.value);
                                  markPhotographConsentChanged();
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  max: "9999-12-31",
                                  min: "1900-01-01"
                                }}
                                disabled={isFormComplete}
                              />
                              <Button
                                variant="outlined"
                                onClick={handleInsertTodayDate}
                                disabled={isFormComplete}
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
                          
                          {/* Signature Area */}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Patient's Signature
                              </Typography>
                              {!isFormComplete && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => clearSignature(canvasRef.current)}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Clear
                                </Button>
                              )}
                            </Box>
                            <Box 
                              className="signature-container"
                              sx={{ 
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: isFormComplete ? '#f5f5f5' : '#ffffff',
                                position: 'relative',
                                cursor: isFormComplete ? 'not-allowed' : 'crosshair',
                                touchAction: isFormComplete ? 'auto' : 'none',
                                pointerEvents: isFormComplete ? 'none' : 'auto'
                              }}
                            >
                              <canvas
                                ref={(canvas) => {
                                  if (canvas && !canvas.dataset.initialized) {
                                    canvasRef.current = canvas;
                                    canvas.width = canvas.offsetWidth;
                                    canvas.height = 150;
                                    canvas.dataset.initialized = 'true';
                                    initCanvas(canvas);
                                  }
                                }}
                                onMouseDown={(e) => startDrawing(e, e.target)}
                                onMouseMove={(e) => draw(e, e.target)}
                                onMouseUp={(e) => stopDrawing(e.target)}
                                onMouseLeave={(e) => stopDrawing(e.target)}
                                onTouchStart={(e) => startDrawing(e, e.target)}
                                onTouchMove={(e) => draw(e, e.target)}
                                onTouchEnd={(e) => stopDrawing(e.target)}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  display: 'block'
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute',
                                  bottom: 8,
                                  left: 0,
                                  right: 0,
                                  textAlign: 'center',
                                  color: 'text.secondary',
                                  pointerEvents: 'none'
                                }}
                              >
                                Sign above
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                      )}

                      {/* Form Complete Notice - Mounjaro */}
                      {isMounjaroFormComplete && form.id === 'mounjaroConsent' && (
                        <Alert severity="info" icon={<CheckCircle />} sx={{ mb: 3 }}>
                          <strong>This form has been completed and locked.</strong> No further edits can be made.
                        </Alert>
                      )}

                      {/* Form Complete Notice - Semaglutide */}
                      {isSemaglutideFormComplete && form.id === 'semaglutideConsent' && (
                        <Alert severity="info" icon={<CheckCircle />} sx={{ mb: 3 }}>
                          <strong>This form has been completed and locked.</strong> No further edits can be made.
                        </Alert>
                      )}

                      {/* Consent Checkbox for Mounjaro - Above Patient Card */}
                      {form.id === 'mounjaroConsent' && (
                      <Card 
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: consentForms[form.id] ? 'success.light' : 'background.paper',
                          border: '2px solid',
                          borderColor: consentForms[form.id] ? 'success.main' : 'divider',
                            mb: 3,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={consentForms[form.id]}
                                onChange={() => handleConsentChange(form.id)}
                                color="success"
                                  disabled={isMounjaroFormComplete}
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
                      </Card>
                    )}
                    
                      {/* Patient Information Card - Mounjaro Consent */}
                      {form.id === 'mounjaroConsent' && (
                      <Card elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={3} className="patient-info-grid">
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Patient's Name as appears on ID"
                              value={mounjaroPatientName}
                              onChange={(e) => {
                                setMounjaroPatientName(e.target.value);
                                markMounjaroConsentChanged();
                              }}
                              placeholder="Enter patient's full name"
                              disabled={isMounjaroFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Patient's Date of Birth"
                              value={mounjaroPatientDOB}
                              onChange={(e) => {
                                setMounjaroPatientDOB(e.target.value);
                                markMounjaroConsentChanged();
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                max: "9999-12-31",
                                min: "1900-01-01"
                              }}
                              disabled={isMounjaroFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                              <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={mounjaroConsentDate}
                                onChange={(e) => {
                                  setMounjaroConsentDate(e.target.value);
                                  markMounjaroConsentChanged();
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  max: "9999-12-31",
                                  min: "1900-01-01"
                                }}
                                disabled={isMounjaroFormComplete}
                              />
                      <Button
                        variant="outlined"
                                onClick={handleInsertMounjaroTodayDate}
                                disabled={isMounjaroFormComplete}
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
                          
                          {/* Signature Area */}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Patient's Signature
                              </Typography>
                              {!isMounjaroFormComplete && (
                      <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => clearSignature(mounjaroCanvasRef.current)}
                        sx={{
                          textTransform: 'none',
                                    fontSize: '0.75rem'
                        }}
                      >
                                  Clear
                      </Button>
                              )}
                    </Box>
                            <Box 
                              className="signature-container"
                              sx={{ 
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: isMounjaroFormComplete ? '#f5f5f5' : '#ffffff',
                                position: 'relative',
                                cursor: isMounjaroFormComplete ? 'not-allowed' : 'crosshair',
                                touchAction: isMounjaroFormComplete ? 'auto' : 'none',
                                pointerEvents: isMounjaroFormComplete ? 'none' : 'auto'
                              }}
                            >
                              <canvas
                                ref={(canvas) => {
                                  if (canvas && !canvas.dataset.initialized) {
                                    mounjaroCanvasRef.current = canvas;
                                    canvas.width = canvas.offsetWidth;
                                    canvas.height = 150;
                                    canvas.dataset.initialized = 'true';
                                    initCanvas(canvas);
                                  }
                                }}
                                onMouseDown={(e) => {
                                  setMounjaroIsDrawing(true);
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
                                  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
                                  ctx.beginPath();
                                  ctx.moveTo(x, y);
                                }}
                                onMouseMove={(e) => {
                                  if (!mounjaroIsDrawing) return;
                                  e.preventDefault();
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
                                  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
                                  ctx.lineTo(x, y);
                                  ctx.stroke();
                                }}
                                onMouseUp={(e) => {
                                  setMounjaroIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                  setMounjaroSignatureData(e.target.toDataURL());
                                  markMounjaroConsentChanged();
                                }}
                                onMouseLeave={(e) => {
                                  setMounjaroIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                }}
                                onTouchStart={(e) => {
                                  setMounjaroIsDrawing(true);
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = e.touches?.[0]?.clientX - rect.left;
                                  const y = e.touches?.[0]?.clientY - rect.top;
                                  ctx.beginPath();
                                  ctx.moveTo(x, y);
                                }}
                                onTouchMove={(e) => {
                                  if (!mounjaroIsDrawing) return;
                                  e.preventDefault();
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = e.touches?.[0]?.clientX - rect.left;
                                  const y = e.touches?.[0]?.clientY - rect.top;
                                  ctx.lineTo(x, y);
                                  ctx.stroke();
                                }}
                                onTouchEnd={(e) => {
                                  setMounjaroIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                  setMounjaroSignatureData(e.target.toDataURL());
                                  markMounjaroConsentChanged();
                                }}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  display: 'block'
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute',
                                  bottom: 8,
                                  left: 0,
                                  right: 0,
                                  textAlign: 'center',
                                  color: 'text.secondary',
                                  pointerEvents: 'none'
                                }}
                              >
                                Sign above
                              </Typography>
                  </Box>
                          </Grid>
                        </Grid>
                      </Card>
                      )}

                      {/* Consent Checkbox for Semaglutide - Above Patient Card */}
                      {form.id === 'semaglutideConsent' && (
                      <Card 
                        elevation={2}
                        sx={{
                          p: 2,
                          backgroundColor: consentForms[form.id] ? 'success.light' : 'background.paper',
                          border: '2px solid',
                          borderColor: consentForms[form.id] ? 'success.main' : 'divider',
                            mb: 3,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={consentForms[form.id]}
                                onChange={() => handleConsentChange(form.id)}
                                color="success"
                                  disabled={isSemaglutideFormComplete}
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
                      </Card>
                    )}
                    
                      {/* Patient Information Card - Semaglutide Consent */}
                      {form.id === 'semaglutideConsent' && (
                      <Card elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={3} className="patient-info-grid">
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Patient's Name as appears on ID"
                              value={semaglutidePatientName}
                              onChange={(e) => {
                                setSemaglutidePatientName(e.target.value);
                                markSemaglutideConsentChanged();
                              }}
                              placeholder="Enter patient's full name"
                              disabled={isSemaglutideFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Patient's Date of Birth"
                              value={semaglutidePatientDOB}
                              onChange={(e) => {
                                setSemaglutidePatientDOB(e.target.value);
                                markSemaglutideConsentChanged();
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                max: "9999-12-31",
                                min: "1900-01-01"
                              }}
                              disabled={isSemaglutideFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                              <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={semaglutideConsentDate}
                                onChange={(e) => {
                                  setSemaglutideConsentDate(e.target.value);
                                  markSemaglutideConsentChanged();
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  max: "9999-12-31",
                                  min: "1900-01-01"
                                }}
                                disabled={isSemaglutideFormComplete}
                              />
                      <Button
                        variant="outlined"
                                onClick={handleInsertSemaglutideTodayDate}
                                disabled={isSemaglutideFormComplete}
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
                          
                          {/* Signature Area */}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Patient's Signature
                              </Typography>
                              {!isSemaglutideFormComplete && (
                      <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => clearSignature(semaglutideCanvasRef.current)}
                        sx={{
                          textTransform: 'none',
                                    fontSize: '0.75rem'
                        }}
                      >
                                  Clear
                      </Button>
                              )}
                    </Box>
                            <Box 
                              className="signature-container"
                              sx={{ 
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: isSemaglutideFormComplete ? '#f5f5f5' : '#ffffff',
                                position: 'relative',
                                cursor: isSemaglutideFormComplete ? 'not-allowed' : 'crosshair',
                                touchAction: isSemaglutideFormComplete ? 'auto' : 'none',
                                pointerEvents: isSemaglutideFormComplete ? 'none' : 'auto'
                              }}
                            >
                              <canvas
                                ref={(canvas) => {
                                  if (canvas && !canvas.dataset.initialized) {
                                    semaglutideCanvasRef.current = canvas;
                                    canvas.width = canvas.offsetWidth;
                                    canvas.height = 150;
                                    canvas.dataset.initialized = 'true';
                                    initCanvas(canvas);
                                  }
                                }}
                                onMouseDown={(e) => {
                                  setSemaglutideIsDrawing(true);
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
                                  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
                                  ctx.beginPath();
                                  ctx.moveTo(x, y);
                                }}
                                onMouseMove={(e) => {
                                  if (!semaglutideIsDrawing) return;
                                  e.preventDefault();
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
                                  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
                                  ctx.lineTo(x, y);
                                  ctx.stroke();
                                }}
                                onMouseUp={(e) => {
                                  setSemaglutideIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                  setSemaglutideSignatureData(e.target.toDataURL());
                                  markSemaglutideConsentChanged();
                                }}
                                onMouseLeave={(e) => {
                                  setSemaglutideIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                }}
                                onTouchStart={(e) => {
                                  setSemaglutideIsDrawing(true);
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = e.touches?.[0]?.clientX - rect.left;
                                  const y = e.touches?.[0]?.clientY - rect.top;
                                  ctx.beginPath();
                                  ctx.moveTo(x, y);
                                }}
                                onTouchMove={(e) => {
                                  if (!semaglutideIsDrawing) return;
                                  e.preventDefault();
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = e.touches?.[0]?.clientX - rect.left;
                                  const y = e.touches?.[0]?.clientY - rect.top;
                                  ctx.lineTo(x, y);
                                  ctx.stroke();
                                }}
                                onTouchEnd={(e) => {
                                  setSemaglutideIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                  setSemaglutideSignatureData(e.target.toDataURL());
                                  markSemaglutideConsentChanged();
                                }}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  display: 'block'
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute',
                                  bottom: 8,
                                  left: 0,
                                  right: 0,
                                  textAlign: 'center',
                                  color: 'text.secondary',
                                  pointerEvents: 'none'
                                }}
                              >
                                Sign above
                              </Typography>
                  </Box>
                          </Grid>
                        </Grid>
                      </Card>
                      )}

                      {/* Form Complete Notice - Telehealth */}
                      {isTelehealthFormComplete && form.id === 'telemedicineConsent' && (
                        <Alert severity="info" icon={<CheckCircle />} sx={{ mb: 3 }}>
                          <strong>This form has been completed and locked.</strong> No further edits can be made.
                        </Alert>
                      )}

                      {/* Consent Checkbox for Telehealth - Above Patient Card */}
                      {form.id === 'telemedicineConsent' && (
                        <Card 
                          elevation={2}
                          sx={{
                            p: 2,
                            backgroundColor: consentForms[form.id] ? 'success.light' : 'background.paper',
                            border: '2px solid',
                            borderColor: consentForms[form.id] ? 'success.main' : 'divider',
                            mb: 3,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={consentForms[form.id]}
                                  onChange={() => handleConsentChange(form.id)}
                                  color="success"
                                  disabled={isTelehealthFormComplete}
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

                      {/* Patient Information Card - Telehealth Consent */}
                      {form.id === 'telemedicineConsent' && (
                      <Card elevation={1} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={3} className="patient-info-grid">
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Patient's Name as appears on ID"
                              value={telehealthPatientName}
                              onChange={(e) => {
                                setTelehealthPatientName(e.target.value);
                                markTelehealthConsentChanged();
                              }}
                              placeholder="Enter patient's full name"
                              disabled={isTelehealthFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              type="date"
                              label="Patient's Date of Birth"
                              value={telehealthPatientDOB}
                              onChange={(e) => {
                                setTelehealthPatientDOB(e.target.value);
                                markTelehealthConsentChanged();
                              }}
                              InputLabelProps={{
                                shrink: true,
                              }}
                              inputProps={{
                                max: "9999-12-31",
                                min: "1900-01-01"
                              }}
                              disabled={isTelehealthFormComplete}
                            />
                          </Grid>
                          
                          <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                              <TextField
                                fullWidth
                                type="date"
                                label="Date"
                                value={telehealthConsentDate}
                                onChange={(e) => {
                                  setTelehealthConsentDate(e.target.value);
                                  markTelehealthConsentChanged();
                                }}
                                InputLabelProps={{
                                  shrink: true,
                                }}
                                inputProps={{
                                  max: "9999-12-31",
                                  min: "1900-01-01"
                                }}
                                disabled={isTelehealthFormComplete}
                              />
                              <Button
                                variant="outlined"
                                onClick={handleInsertTelehealthTodayDate}
                                disabled={isTelehealthFormComplete}
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
                          
                          {/* Signature Area */}
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                                Patient's Signature
                              </Typography>
                              {!isTelehealthFormComplete && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => clearSignature(telehealthCanvasRef.current)}
                                  sx={{ 
                                    textTransform: 'none',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  Clear
                                </Button>
                              )}
                            </Box>
                            <Box 
                              className="signature-container"
                              sx={{ 
                                border: '2px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                backgroundColor: isTelehealthFormComplete ? '#f5f5f5' : '#ffffff',
                                position: 'relative',
                                cursor: isTelehealthFormComplete ? 'not-allowed' : 'crosshair',
                                touchAction: isTelehealthFormComplete ? 'auto' : 'none',
                                pointerEvents: isTelehealthFormComplete ? 'none' : 'auto'
                              }}
                            >
                              <canvas
                                ref={(canvas) => {
                                  if (canvas && !canvas.dataset.initialized) {
                                    telehealthCanvasRef.current = canvas;
                                    canvas.width = canvas.offsetWidth;
                                    canvas.height = 150;
                                    canvas.dataset.initialized = 'true';
                                    initCanvas(canvas);
                                  }
                                }}
                                onMouseDown={(e) => {
                                  setTelehealthIsDrawing(true);
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
                                  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
                                  ctx.beginPath();
                                  ctx.moveTo(x, y);
                                }}
                                onMouseMove={(e) => {
                                  if (!telehealthIsDrawing) return;
                                  e.preventDefault();
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
                                  const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
                                  ctx.lineTo(x, y);
                                  ctx.stroke();
                                }}
                                onMouseUp={(e) => {
                                  setTelehealthIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                  setTelehealthSignatureData(e.target.toDataURL());
                                  markTelehealthConsentChanged();
                                }}
                                onMouseLeave={(e) => {
                                  setTelehealthIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                }}
                                onTouchStart={(e) => {
                                  setTelehealthIsDrawing(true);
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = e.touches?.[0]?.clientX - rect.left;
                                  const y = e.touches?.[0]?.clientY - rect.top;
                                  ctx.beginPath();
                                  ctx.moveTo(x, y);
                                }}
                                onTouchMove={(e) => {
                                  if (!telehealthIsDrawing) return;
                                  e.preventDefault();
                                  const ctx = e.target.getContext('2d');
                                  const rect = e.target.getBoundingClientRect();
                                  const x = e.touches?.[0]?.clientX - rect.left;
                                  const y = e.touches?.[0]?.clientY - rect.top;
                                  ctx.lineTo(x, y);
                                  ctx.stroke();
                                }}
                                onTouchEnd={(e) => {
                                  setTelehealthIsDrawing(false);
                                  const ctx = e.target.getContext('2d');
                                  ctx.closePath();
                                  setTelehealthSignatureData(e.target.toDataURL());
                                  markTelehealthConsentChanged();
                                }}
                                style={{
                                  width: '100%',
                                  height: '150px',
                                  display: 'block'
                                }}
                              />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  position: 'absolute',
                                  bottom: 8,
                                  left: 0,
                                  right: 0,
                                  textAlign: 'center',
                                  color: 'text.secondary',
                                  pointerEvents: 'none'
                                }}
                              >
                                Sign above
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Card>
                      )}
                      </>
                    )}
                    
                    </Box>
                    {/* End Printable Content Wrapper */}

                    {/* Navigation Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }} className="no-print">
          <Button
            variant="outlined"
                        onClick={() => {
                          if (form.id === 'photographConsent') {
                            handleSavePhotographConsent();
                          } else if (form.id === 'mounjaroConsent') {
                            handleSaveMounjaroConsent();
                          } else if (form.id === 'semaglutideConsent') {
                            handleSaveSemaglutideConsent();
                          } else if (form.id === 'telemedicineConsent') {
                            handleSaveTelehealthConsent();
                          } else {
                            setActiveTab(Math.max(0, activeTab - 1));
                          }
                        }}
                        disabled={
                          form.id === 'photographConsent' 
                            ? (!hasChanges || isSaving || isFormComplete) 
                            : form.id === 'mounjaroConsent'
                            ? (!mounjaroHasChanges || isSaving || isMounjaroFormComplete)
                            : form.id === 'semaglutideConsent'
                            ? (!semaglutideHasChanges || isSaving || isSemaglutideFormComplete)
                            : form.id === 'telemedicineConsent'
                            ? (!telehealthHasChanges || isSaving || isTelehealthFormComplete)
                            : activeTab === 0
                        }
            sx={{ textTransform: 'none' }}
          >
                        {form.id === 'photographConsent' 
                          ? (isSaving ? 'Saving...' : 'Save') 
                          : form.id === 'mounjaroConsent'
                          ? (isSaving ? 'Saving...' : 'Save')
                          : form.id === 'semaglutideConsent'
                          ? (isSaving ? 'Saving...' : 'Save')
                          : form.id === 'telemedicineConsent'
                          ? (isSaving ? 'Saving...' : 'Save')
                          : 'Save'}
          </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          if (form.id === 'photographConsent') {
                            handleCompletePhotographConsent();
                          } else if (form.id === 'mounjaroConsent') {
                            handleCompleteMounjaroConsent();
                          } else if (form.id === 'semaglutideConsent') {
                            handleCompleteSemaglutideConsent();
                          } else if (form.id === 'telemedicineConsent') {
                            handleCompleteTelehealthConsent();
                          } else {
                            setActiveTab(Math.min(forms.length - 1, activeTab + 1));
                          }
                          if(forms.length === Object.values(consentForms).filter(v => v === true).length){
                            dispatch(updatePreAppointmentTaskAction({ 
                              taskKey: 'completeConsentForms', 
                              completed: true 
                            }));
                          }else{
                              dispatch(updatePreAppointmentTaskAction({ 
                                taskKey: 'completeConsentForms', 
                                completed: false 
                              }));
                          }
                        }}
                        disabled={
                          form.id === 'photographConsent' 
                            ? (!isPhotographConsentComplete() || isSaving || isFormComplete)
                            : form.id === 'mounjaroConsent'
                            ? (!isMounjaroConsentComplete() || isSaving || isMounjaroFormComplete)
                            : form.id === 'semaglutideConsent'
                            ? (!isSemaglutideConsentComplete() || isSaving || isSemaglutideFormComplete)
                            : form.id === 'telemedicineConsent'
                            ? (!isTelehealthConsentComplete() || isSaving || isTelehealthFormComplete)
                            : activeTab === forms.length - 1
                        }
                        sx={{
                          textTransform: 'none',
                          backgroundColor: '#877449',
                          '&:hover': {
                            backgroundColor: '#B8941F',
                          }
                        }}
                      >
                        {(form.id === 'photographConsent' || form.id === 'mounjaroConsent' || form.id === 'semaglutideConsent' || form.id === 'telemedicineConsent') && isSaving ? 'Completing...' : 'Complete'}
                      </Button>
        </Box>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Success/Error Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity={saveError ? 'error' : 'success'}
            sx={{ width: '100%' }}
          >
            {saveError 
              ? `Error: ${saveError}` 
              : wasTelehealthSaved
                ? 'Telehealth consent completed and saved successfully!'
                : wasMounjaroSaved
                  ? 'Mounjaro consent completed and saved successfully!'
                  : wasSemaglutideSaved
                    ? 'Semaglutide consent completed and saved successfully!'
                    : wasCompleted 
                      ? 'Photograph consent completed and saved successfully!' 
                      : 'Photograph consent saved successfully!'}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

