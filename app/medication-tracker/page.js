'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { saveMedication, fetchAllMedications } from '../../store/slices/medicationSlice';
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
  Paper,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Medication,
  Add,
  Edit,
  Delete,
  Schedule,
  ShowChart,
  Timeline,
  TrendingUp,
  Save,
  Cancel,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MedicationTracker() {
  const { user, isLoading, error } = useUser();
  
  // Redux hooks
  const dispatch = useDispatch();
  const medicationState = useSelector((state) => state.medication);
  
  // Access control - Admin or Patient with consultation
  useConsultationAccess();
  const [mounted, setMounted] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    medicationName: '',
    dosage: '',
    notes: ''
  });

  // Common medications list
  const commonMedications = [
    'Mounjaro',
    'Other'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load medications from database when component mounts
  useEffect(() => {
    if (user && mounted) {
      console.log('💊 Medication Tracker: Fetching medications from database...');
      dispatch(fetchAllMedications());
    }
  }, [user, mounted, dispatch]);

  // Load medication history from Redux state
  useEffect(() => {
    if (medicationState.allMedicationsLoaded && medicationState.allMedications) {
      console.log('💊 Medication Tracker: Loading medication history from Redux state', {
        count: medicationState.allMedications.length,
        data: medicationState.allMedications
      });
      
      // Transform medications to history format
      const history = medicationState.allMedications.map((medication, index) => {
        return {
          id: medication._id || `medication-${index}`,
          date: medication.date,
          time: medication.time,
          medicationName: medication.medicationName,
          dosage: medication.dosage,
          notes: medication.notes || '',
          timestamp: new Date(medication.timestamp).getTime()
        };
      });
      
      console.log('💊 Medication Tracker: Transformed medication history', history);
      setMedicationHistory(history);
    } else if (medicationState.allMedicationsLoaded && medicationState.allMedications.length === 0) {
      console.log('💊 Medication Tracker: No medication history found');
      setMedicationHistory([]);
    }
  }, [medicationState.allMedicationsLoaded, medicationState.allMedications]);

  // Handle successful save
  useEffect(() => {
    if (medicationState.isSaved && !medicationState.isLoading) {
      console.log('✅ Medication saved successfully, reloading all medications');
      
      // Reload all medications to get updated list
      dispatch(fetchAllMedications());
    }
  }, [medicationState.isSaved, medicationState.isLoading, dispatch]);

  // Load medication data when date changes
  useEffect(() => {
    if (newEntry.date && medicationState.allMedications && medicationState.allMedications.length > 0) {
      console.log('📅 Checking for existing medication on date:', newEntry.date);
      
      // Find medication entry for the selected date
      const existingMedication = medicationState.allMedications.find(
        med => med.date === newEntry.date
      );
      
      if (existingMedication) {
        console.log('✅ Found existing medication for date:', existingMedication);
        
        // Pre-fill form with existing medication data
        setNewEntry(prev => ({
          ...prev,
          time: existingMedication.time || prev.time,
          medicationName: existingMedication.medicationName || '',
          dosage: existingMedication.dosage || '',
          notes: existingMedication.notes || ''
        }));
      } else {
        console.log('📝 No existing medication found for date, clearing fields');
        
        // Clear form fields except date
        setNewEntry(prev => ({
          ...prev,
          medicationName: '',
          dosage: '',
          notes: ''
          // Keep time as is
        }));
      }
    }
  }, [newEntry.date, medicationState.allMedications]);

  // Prepare chart data
  const chartData = medicationHistory
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: entry.time,
      medication: entry.medicationName,
      dosage: entry.dosage,
      fullDateTime: `${entry.date}T${entry.time}`,
      timestamp: new Date(`${entry.date}T${entry.time}`).getTime()
    }));

  // Group by medication for frequency chart
  const medicationFrequency = {};
  medicationHistory.forEach(entry => {
    if (!medicationFrequency[entry.medicationName]) {
      medicationFrequency[entry.medicationName] = 0;
    }
    medicationFrequency[entry.medicationName]++;
  });

  const frequencyChartData = Object.entries(medicationFrequency).map(([medication, count]) => ({
    medication,
    count
  }));

  const handleAddEntry = () => {
    setIsAddingEntry(true);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      medicationName: '',
      dosage: '',
      notes: ''
    });
  };

  const handleSaveEntry = () => {
    if (!newEntry.medicationName || !newEntry.dosage) {
      alert('Please enter medication name and dosage');
      return;
    }

    console.log('🔄 Saving medication entry via saga:', newEntry);

    // Prepare medication data for saga
    const medicationData = {
      medicationName: newEntry.medicationName,
      dosage: newEntry.dosage,
      date: newEntry.date,
      time: newEntry.time,
      notes: newEntry.notes || ''
    };

    // Dispatch saga to save medication
    dispatch(saveMedication(medicationData));
    
    setIsAddingEntry(false);
    setNewEntry({ 
      date: new Date().toISOString().split('T')[0], 
      time: new Date().toTimeString().slice(0, 5),
      medicationName: '', 
      dosage: '', 
      notes: '' 
    });
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedHistory = medicationHistory.filter(entry => entry.id !== entryId);
      setMedicationHistory(updatedHistory);
      
      // TODO: Create delete API and saga
      console.log('Deleted medication entry:', entryId);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading medication tracker...
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
            Error loading medication tracker: {error.message}
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
              Please log in to track your medications.
            </Typography>
            <Button
              href="/api/auth/login"
              variant="contained"
              size="large"
              startIcon={<Medication />}
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
            Loading medication tracker...
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
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mr: 3, 
                  backgroundColor: 'primary.main' 
                }}
              >
                <Medication sx={{ fontSize: 30 }} />
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
                  Medication Tracker
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.name || 'User'} • Track your medication intake and dosage
                </Typography>
              </Box>
            </Box>
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
                Log Medication
              </Box>
            </Button>
          </Box>
        </Paper>

        {/* Log Medication Form */}
        {isAddingEntry ? (
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" component="h2">
                  Log Medication
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
                <Box sx={{ width: '100%' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        required
                        label="Time"
                        type="time"
                        value={newEntry.time}
                        onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccessTime sx={{ color: '#877449' }} />
                            </InputAdornment>
                          ),
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
                  </Grid>
                </Box>
                
                <FormControl fullWidth required>
                  <InputLabel>Medication Name</InputLabel>
                  <Select
                    value={newEntry.medicationName}
                    onChange={(e) => setNewEntry({...newEntry, medicationName: e.target.value})}
                    label="Medication Name"
                  >
                    {commonMedications.map((medication) => (
                      <MenuItem key={medication} value={medication}>
                        {medication}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  required
                  label="Dosage in mg"
                  value={newEntry.dosage}
                  onChange={(e) => setNewEntry({...newEntry, dosage: e.target.value})}
                  placeholder="e.g., 500, 1000"
                />
                
                <TextField
                  fullWidth
                  label="Notes (optional)"
                  multiline
                  rows={3}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                  placeholder="Any additional notes about this medication..."
                />
                
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
        {/* Charts */}
        {chartData.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Medication Timeline
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'time' ? 'Time' : 'Dosage']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="time" 
                        stroke="#1976d2" 
                        strokeWidth={2}
                        name="Time"
                        dot={{ r: 4 }}
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
                    Medication Frequency
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={frequencyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="medication" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#dc004e" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Medication History */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" component="h2">
                Medication History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {medicationHistory.length} entries
              </Typography>
            </Box>
            
            {medicationHistory.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Schedule sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No medication entries yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start tracking your medications to see your intake patterns over time
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {medicationHistory
                  .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
                  .map((entry) => (
                    <Paper key={entry.id} elevation={1} sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6">
                            {entry.medicationName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(entry.date).toLocaleDateString()} at {entry.time}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              label={`Dosage: ${entry.dosage} mg`} 
                              color="primary"
                              size="small"
                              sx={{ mr: 1 }}
                            />
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
                  ))}
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

