'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMeasurements, fetchAllMeasurements, saveMeasurements } from '../../store/slices/measurementsSlice';
import Header from '../../components/Header';
import PageTitle from '../../components/PageTitle';
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
  Paper,
  Avatar,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Scale,
  TrendingUp,
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  ShowChart,
  CalendarToday,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function WeightLogging() {
  const { user, isLoading, error } = useUser();
  
  // Redux hooks
  const dispatch = useDispatch();
  const measurementsState = useSelector((state) => state.measurements);
  
  // Access control - Admin or Patient with consultation
  useConsultationAccess();
  const [mounted, setMounted] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentHeightFeet, setCurrentHeightFeet] = useState('');
  const [currentHeightInches, setCurrentHeightInches] = useState('');
  const [currentWaistCircumference, setCurrentWaistCircumference] = useState('');
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    heightFeet: '',
    heightInches: '',
    waistCircumference: '',
    notes: ''
  });
  const lastLoadedDateRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load measurements from database when component mounts
  useEffect(() => {
    if (user && mounted) {
      console.log('📊 Weight Logging: Fetching measurements from database...');
      dispatch(fetchMeasurements());
      dispatch(fetchAllMeasurements());
    }
  }, [user, mounted, dispatch]);

  // Load measurements data when Redux state updates
  useEffect(() => {
    if (measurementsState.isLoaded && measurementsState.measurements) {
      console.log('📊 Weight Logging: Loading measurements from Redux state', measurementsState.measurements);
      
      const measurements = measurementsState.measurements;
      
      // Load height in feet and inches
      if (measurements.heightFeet) {
        console.log('📊 Weight Logging: Setting height:', measurements.heightFeet, 'feet', measurements.heightInches || 0, 'inches');
        setCurrentHeightFeet(measurements.heightFeet.toString());
        setCurrentHeightInches((measurements.heightInches || 0).toString());
      }
      
      // Load waist circumference if available
      if (measurements.waistCircumference) {
        console.log('📊 Weight Logging: Setting waist circumference:', measurements.waistCircumference, 'inches');
        setCurrentWaistCircumference(measurements.waistCircumference.toString());
      }
    } else if (measurementsState.isLoaded && !measurementsState.measurements) {
      console.log('📊 Weight Logging: No measurements found in database, using fallback data');
      
      // Fallback to localStorage/user metadata if no measurements in DB
      if (user) {
        const savedWaistCircumference = user.user_metadata?.waist_circumference || '';
        setCurrentWaistCircumference(savedWaistCircumference);
        
        const appointmentHeightFeet = localStorage.getItem('appointmentHeightFeet');
        const appointmentHeightInches = localStorage.getItem('appointmentHeightInches');
        
        if (appointmentHeightFeet) {
          setCurrentHeightFeet(appointmentHeightFeet);
          setCurrentHeightInches(appointmentHeightInches || '0');
        }
      }
    }
  }, [measurementsState.isLoaded, measurementsState.measurements, user]);

  // Load weight history from allMeasurements
  useEffect(() => {
    if (measurementsState.allMeasurementsLoaded && measurementsState.allMeasurements) {
      console.log('📊 Weight Logging: Loading weight history from allMeasurements', {
        count: measurementsState.allMeasurements.length,
        data: measurementsState.allMeasurements
      });
      
      // Transform allMeasurements to weight history format (imperial units)
      const history = measurementsState.allMeasurements.map((measurement, index) => {
        console.log(`📊 Entry ${index}:`, {
          waistCircumference: measurement.waistCircumference,
          waistType: typeof measurement.waistCircumference,
          waistValue: measurement.waistCircumference
        });
        
        return {
          id: measurement._id || `measurement-${index}`,
          date: measurement.dateKey || measurement.createdAt || new Date().toISOString(),
          weight: measurement.weight, // lbs
          heightFeet: measurement.heightFeet,
          heightInches: measurement.heightInches || 0,
          waistCircumference: measurement.waistCircumference || null, // inches
          bmi: measurement.bmi,
          notes: measurement.notes || ''
        };
      });
      
      console.log('📊 Weight Logging: Transformed weight history', history);
      setWeightHistory(history);
      
      // If current height is not set, use the height from the latest measurement
      if (history.length > 0 && !currentHeightFeet) {
        const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestMeasurement = sortedHistory[0];
        if (latestMeasurement.heightFeet) {
          console.log('📊 Weight Logging: Setting current height from latest measurement');
          setCurrentHeightFeet(latestMeasurement.heightFeet.toString());
          setCurrentHeightInches((latestMeasurement.heightInches || 0).toString());
        }
      }
      
      // If current waist circumference is not set, use the latest one from measurements
      if (history.length > 0 && !currentWaistCircumference) {
        const sortedHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date));
        // Find the latest measurement that has waist circumference
        const latestWithWaist = sortedHistory.find(m => m.waistCircumference);
        if (latestWithWaist && latestWithWaist.waistCircumference) {
          console.log('📊 Weight Logging: Setting current waist circumference from latest measurement');
          setCurrentWaistCircumference(latestWithWaist.waistCircumference.toString());
        }
      }
    } else if (measurementsState.allMeasurementsLoaded && measurementsState.allMeasurements.length === 0) {
      console.log('📊 Weight Logging: No weight history found in allMeasurements');
      setWeightHistory([]);
    }
  }, [measurementsState.allMeasurementsLoaded, measurementsState.allMeasurements, currentHeightFeet, currentWaistCircumference]);

  // Check store for measurements when date changes in form
  useEffect(() => {
    if (isAddingEntry && newEntry.date && measurementsState.allMeasurementsLoaded && measurementsState.allMeasurements) {
      // Only check if we haven't already loaded data for this date
      if (lastLoadedDateRef.current !== newEntry.date) {
        console.log('📅 Checking for existing measurement on date:', newEntry.date);
        
        // Find measurement for the selected date using dateKey
        const existingMeasurement = measurementsState.allMeasurements.find(measurement => {
          const measurementDate = measurement.dateKey || new Date(measurement.createdAt).toISOString().split('T')[0];
          return measurementDate === newEntry.date;
        });
        
        if (existingMeasurement) {
          console.log('✅ Found existing measurement for date:', existingMeasurement);
          
          // Pre-fill form with existing measurement data
          setNewEntry(prev => ({
            ...prev,
            weight: existingMeasurement.weight?.toString() || '',
            heightFeet: existingMeasurement.heightFeet?.toString() || '',
            heightInches: (existingMeasurement.heightInches || 0).toString(),
            waistCircumference: existingMeasurement.waistCircumference?.toString() || '',
            notes: existingMeasurement.notes || ''
          }));
          
          // Mark this date as loaded
          lastLoadedDateRef.current = newEntry.date;
        } else {
          console.log('📭 No existing measurement found for date:', newEntry.date);
          
          // Clear form fields when no measurement exists for this date
          setNewEntry(prev => ({
            ...prev,
            weight: '',
            heightFeet: currentHeightFeet || '',
            heightInches: currentHeightInches || '',
            waistCircumference: '',
            notes: ''
          }));
          
          // Mark this date as checked
          lastLoadedDateRef.current = newEntry.date;
        }
      }
    }
  }, [newEntry.date, isAddingEntry, measurementsState.allMeasurementsLoaded, measurementsState.allMeasurements, currentHeightFeet, currentHeightInches]);

  // Reset the lastLoadedDateRef when closing the form
  useEffect(() => {
    if (!isAddingEntry) {
      lastLoadedDateRef.current = null;
    }
  }, [isAddingEntry]);

  // Handle successful save
  useEffect(() => {
    if (measurementsState.isSaved && !measurementsState.isLoading) {
      console.log('✅ Measurement saved successfully, reloading all measurements');
      
      // Reload all measurements to get updated list
      dispatch(fetchAllMeasurements());
    }
  }, [measurementsState.isSaved, measurementsState.isLoading, dispatch]);

  // Calculate BMI from lbs and feet/inches
  const calculateBMI = (weightLbs, heightFeet, heightInches = 0) => {
    if (!weightLbs || !heightFeet) return null;
    
    // Convert to total inches
    const totalInches = (parseInt(heightFeet) * 12) + (parseInt(heightInches) || 0);
    
    // BMI formula for imperial: (weight in lbs / (height in inches)²) × 703
    const bmi = (weightLbs / (totalInches * totalInches)) * 703;
    return bmi.toFixed(1);
  };

  // Get BMI category
  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { category: 'Underweight', color: 'info' };
    if (bmi < 25) return { category: 'Normal weight', color: 'success' };
    if (bmi < 30) return { category: 'Overweight', color: 'warning' };
    return { category: 'Obese', color: 'error' };
  };

  // Prepare chart data
  const chartData = weightHistory
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: parseFloat(entry.weight),
      bmi: calculateBMI(entry.weight, entry.heightFeet, entry.heightInches),
      waistCircumference: entry.waistCircumference ? parseFloat(entry.waistCircumference) : null,
      fullDate: entry.date
    }));

  // Get latest weight and BMI
  const latestEntry = weightHistory.length > 0 
    ? weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
  
  const currentBMI = latestEntry ? calculateBMI(latestEntry.weight, latestEntry.heightFeet, latestEntry.heightInches) : null;
  const bmiInfo = currentBMI ? getBMICategory(currentBMI) : null;

  const handleAddEntry = () => {
    setIsAddingEntry(true);
    
    // Pre-populate with current height (default to current user height)
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      heightFeet: currentHeightFeet || '',
      heightInches: currentHeightInches || '',
      waistCircumference: '',
      notes: ''
    });
  };

  const handleSaveEntry = () => {
    if (!newEntry.weight || !newEntry.heightFeet) {
      alert('Please enter your weight and height');
      return;
    }

    console.log('🔄 Saving measurement entry via saga:', newEntry);

    // Calculate BMI for this entry
    const bmi = calculateBMI(newEntry.weight, newEntry.heightFeet, newEntry.heightInches);
    const bmiInfo = getBMICategory(bmi);

    // Prepare measurement data for saga
    const measurementData = {
      weight: parseFloat(newEntry.weight),
      heightFeet: parseInt(newEntry.heightFeet),
      heightInches: parseInt(newEntry.heightInches) || 0,
      waistCircumference: newEntry.waistCircumference ? parseFloat(newEntry.waistCircumference) : null,
      bmi: bmi,
      bmiCategory: bmiInfo?.category,
      date: newEntry.date, // Include the date for the measurement
      notes: newEntry.notes || ''
    };

    // Dispatch saga to save measurements
    dispatch(saveMeasurements(measurementData));
    
    setIsAddingEntry(false);
    setNewEntry({ 
      date: new Date().toISOString().split('T')[0], 
      weight: '', 
      heightFeet: '', 
      heightInches: '', 
      waistCircumference: '', 
      notes: '' 
    });
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedHistory = weightHistory.filter(entry => entry.id !== entryId);
      setWeightHistory(updatedHistory);
      
      // Save to user metadata
      console.log('Deleted weight entry:', entryId);
    }
  };

  const handleSaveHeight = () => {
    if (!currentHeightFeet) {
      alert('Please enter your height');
      return;
    }

    // Save height to user metadata
    console.log('Saving height:', currentHeightFeet, 'feet', currentHeightInches, 'inches');
  };

  const handleSaveWaistCircumference = () => {
    if (!currentWaistCircumference) {
      alert('Please enter your waist circumference');
      return;
    }

    // Save waist circumference to user metadata
    console.log('Saving waist circumference:', currentWaistCircumference);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading weight logging...
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
            Error loading weight logging: {error.message}
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
              Please log in to track your weight.
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

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading weight logging...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <PageTitle
          actions={
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddEntry}
              sx={{
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 },
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Add Weight Entry</Box>
            </Button>
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, mr: 3, backgroundColor: 'primary.main' }}>
              <Scale sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                gutterBottom
                color="primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' }, fontWeight: 600 }}
              >
                Weight Tracker
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {user.name || 'User'} • Track your weight, BMI, and waist circumference
              </Typography>
            </Box>
          </Box>
        </PageTitle>

        {/* Add Entry Form */}
        {isAddingEntry ? (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                  Enter Measurements
                </Typography>
                <IconButton
                  onClick={() => setIsAddingEntry(false)}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <Cancel />
                </IconButton>
              </Box>
              
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  required
                  label="Date"
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
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
                <TextField
                  fullWidth
                  label="Weight (lbs)"
                  type="number"
                  value={newEntry.weight}
                  onChange={(e) => setNewEntry({...newEntry, weight: e.target.value})}
                  inputProps={{ step: "0.1", min: "0" }}
                />
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Height (feet)"
                    type="number"
                    value={newEntry.heightFeet}
                    onChange={(e) => setNewEntry({...newEntry, heightFeet: e.target.value})}
                    inputProps={{ min: "1", max: "8" }}
                    placeholder="5"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    ft
                  </Typography>
                  <TextField
                    label="Height (inches)"
                    type="number"
                    value={newEntry.heightInches}
                    onChange={(e) => setNewEntry({...newEntry, heightInches: e.target.value})}
                    inputProps={{ min: "0", max: "11" }}
                    placeholder="6"
                    sx={{ flex: 1 }}
                  />
                  <Typography variant="h6" color="text.secondary">
                    in
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  label="Waist Circumference (inches)"
                  type="number"
                  value={newEntry.waistCircumference}
                  onChange={(e) => setNewEntry({...newEntry, waistCircumference: e.target.value})}
                  inputProps={{ step: "0.1", min: "0" }}
                  placeholder="Optional"
                />
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  multiline
                  rows={3}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                  placeholder="Any notes about this weight measurement..."
                />
                {newEntry.weight && newEntry.heightFeet && (
                  <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      BMI for this entry: {calculateBMI(newEntry.weight, newEntry.heightFeet, newEntry.heightInches)}
                    </Typography>
                    {getBMICategory(calculateBMI(newEntry.weight, newEntry.heightFeet, newEntry.heightInches)) && (
                      <Chip 
                        label={getBMICategory(calculateBMI(newEntry.weight, newEntry.heightFeet, newEntry.heightInches)).category}
                        color={getBMICategory(calculateBMI(newEntry.weight, newEntry.heightFeet, newEntry.heightInches)).color}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    onClick={() => setIsAddingEntry(false)}
                    variant="outlined"
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEntry} 
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ textTransform: 'none' }}
                  >
                    Save Entry
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Current Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
                <Scale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Current Weight
                </Typography>
                <Typography variant="h4" color="primary">
                  {latestEntry ? `${latestEntry.weight} lbs` : 'No data'}
                </Typography>
                {latestEntry && (
                  <Typography variant="body2" color="text.secondary">
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
                <Person sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Height
                </Typography>
                <Typography variant="h4" color="info">
                  {currentHeightFeet ? `${currentHeightFeet}'${currentHeightInches || 0}"` : 'Not set'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
                <ShowChart sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Waist Circumference
                </Typography>
                <Typography variant="h4" color="success">
                  {latestEntry?.waistCircumference ? `${latestEntry.waistCircumference} in` : 
                   currentWaistCircumference ? `${currentWaistCircumference} in` : 'No data'}
                </Typography>
                {latestEntry?.waistCircumference && (
                  <Typography variant="body2" color="text.secondary">
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
                <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Current BMI
                </Typography>
                <Typography variant="h4" color="secondary">
                  {currentBMI || 'No data'}
                </Typography>
                {bmiInfo && (
                  <Chip 
                    label={bmiInfo.category} 
                    color={bmiInfo.color} 
                    size="small" 
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts */}
        {chartData.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Weight Progress
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'weight' ? 'Weight (lbs)' : 'BMI']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="#1976d2" 
                        strokeWidth={2}
                        name="Weight"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    BMI Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip 
                        formatter={(value) => [value, 'BMI']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="bmi" 
                        stroke="#dc004e" 
                        strokeWidth={2}
                        name="BMI"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Waist Circumference
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [value, 'Waist (in)']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="waistCircumference" 
                        stroke="#2e7d32" 
                        strokeWidth={2}
                        name="Waist Circumference"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Weight History */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" component="h2">
                Weight History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {weightHistory.length} entries
              </Typography>
            </Box>
            
            {weightHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Scale sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No weight entries yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start tracking your weight to see your progress over time
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddEntry}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Add First Entry
                  </Box>
                </Button>
              </Box>
            ) : (
              <Stack spacing={2}>
                {weightHistory
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((entry) => {
                    const entryBMI = calculateBMI(entry.weight, entry.heightFeet, entry.heightInches);
                    const entryBMIInfo = entryBMI ? getBMICategory(entryBMI) : null;
                    
                    return (
                      <Paper key={entry.id} elevation={1} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">
                              {entry.weight} lbs
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {entry.date}
                            </Typography>
                            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {entryBMI && (
                                <Chip 
                                  label={`BMI: ${entryBMI}`} 
                                  color={entryBMIInfo?.color || 'default'}
                                  size="small"
                                />
                              )}
                              {entryBMIInfo && (
                                <Chip 
                                  label={entryBMIInfo.category} 
                                  color={entryBMIInfo.color}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {entry.heightFeet && (
                                <Chip 
                                  label={`Height: ${entry.heightFeet}'${entry.heightInches || 0}"`} 
                                  color="info"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {entry.waistCircumference !== null && entry.waistCircumference !== undefined && entry.waistCircumference !== '' && (
                                <Chip 
                                  label={`Waist: ${entry.waistCircumference} in`} 
                                  color="success"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </Box>
                            {entry.notes && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                                {entry.notes}
                              </Typography>
                            )}
                          </Box>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteEntry(entry.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Paper>
                    );
                  })}
              </Stack>
            )}
          </CardContent>
        </Card>
          </>
        )}
      </Container>
    </>
  );
}
