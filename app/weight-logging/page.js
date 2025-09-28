'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
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
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function WeightLogging() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [currentHeight, setCurrentHeight] = useState('');
  const [currentWaistCircumference, setCurrentWaistCircumference] = useState('');
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: '',
    waistCircumference: '',
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user's weight history and height from Auth0 metadata and pre-appointment measurements
  useEffect(() => {
    if (user) {
      // Load weight history from user metadata
      const savedHistory = user.user_metadata?.weight_history || [];
      setWeightHistory(savedHistory);
      
      // Load waist circumference from user metadata
      const savedWaistCircumference = user.user_metadata?.waist_circumference || '';
      setCurrentWaistCircumference(savedWaistCircumference);
      
      // Load height from pre-appointment measurements (localStorage) or fallback to user metadata
      const appointmentHeightFeet = localStorage.getItem('appointmentHeightFeet');
      const appointmentHeightInches = localStorage.getItem('appointmentHeightInches');
      
      if (appointmentHeightFeet) {
        // Convert feet and inches to centimeters for consistency with existing BMI calculation
        const totalInches = (parseInt(appointmentHeightFeet) * 12) + (parseInt(appointmentHeightInches) || 0);
        const heightInCm = totalInches * 2.54; // Convert inches to cm
        setCurrentHeight(heightInCm.toString());
      } else {
        // Fallback to user metadata height
        const savedHeight = user.user_metadata?.height || '';
        setCurrentHeight(savedHeight);
      }
    }
  }, [user]);

  // Calculate BMI
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = height / 100; // Convert cm to meters
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
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
      bmi: calculateBMI(entry.weight, currentHeight),
      waistCircumference: entry.waistCircumference ? parseFloat(entry.waistCircumference) : null,
      fullDate: entry.date
    }));

  // Get latest weight and BMI
  const latestEntry = weightHistory.length > 0 
    ? weightHistory.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null;
  
  const currentBMI = latestEntry ? calculateBMI(latestEntry.weight, currentHeight) : null;
  const bmiInfo = currentBMI ? getBMICategory(currentBMI) : null;

  const handleAddEntry = () => {
    setIsAddingEntry(true);
    
    // Pre-populate with appointment measurements if available
    const appointmentWeight = localStorage.getItem('appointmentWeight');
    const appointmentHeightFeet = localStorage.getItem('appointmentHeightFeet');
    const appointmentHeightInches = localStorage.getItem('appointmentHeightInches');
    
    let prePopulatedHeight = '';
    if (appointmentHeightFeet) {
      // Convert feet and inches to centimeters for consistency
      const totalInches = (parseInt(appointmentHeightFeet) * 12) + (parseInt(appointmentHeightInches) || 0);
      prePopulatedHeight = (totalInches * 2.54).toString(); // Convert to cm
    }
    
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      weight: appointmentWeight || '',
      height: prePopulatedHeight,
      waistCircumference: '',
      notes: ''
    });
  };

  const handleSaveEntry = () => {
    if (!newEntry.weight) {
      alert('Please enter your weight');
      return;
    }

    const entry = {
      ...newEntry,
      id: Date.now(),
      weight: parseFloat(newEntry.weight),
      height: newEntry.height ? parseFloat(newEntry.height) : null,
      waistCircumference: newEntry.waistCircumference ? parseFloat(newEntry.waistCircumference) : null
    };

    const updatedHistory = [...weightHistory, entry];
    setWeightHistory(updatedHistory);
    
    // Save to user metadata (in a real app, this would be an API call)
    console.log('Saving weight entry:', entry);
    console.log('Updated weight history:', updatedHistory);
    
    setIsAddingEntry(false);
    setNewEntry({ date: '', weight: '', height: '', waistCircumference: '', notes: '' });
    alert('Weight entry saved successfully!');
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedHistory = weightHistory.filter(entry => entry.id !== entryId);
      setWeightHistory(updatedHistory);
      
      // Save to user metadata
      console.log('Deleted weight entry:', entryId);
      alert('Weight entry deleted successfully!');
    }
  };

  const handleSaveHeight = () => {
    if (!currentHeight) {
      alert('Please enter your height');
      return;
    }

    // Save height to user metadata
    console.log('Saving height:', currentHeight);
    alert('Height saved successfully!');
  };

  const handleSaveWaistCircumference = () => {
    if (!currentWaistCircumference) {
      alert('Please enter your waist circumference');
      return;
    }

    // Save waist circumference to user metadata
    console.log('Saving waist circumference:', currentWaistCircumference);
    alert('Waist circumference saved successfully!');
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
                <Scale sx={{ fontSize: 30 }} />
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
                  Weight Tracker
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.name || 'User'} • Track your weight, BMI, and waist circumference
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
                Add Weight Entry
              </Box>
            </Button>
          </Box>
        </Paper>

        {/* Current Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', minHeight: 200 }}>
                <Scale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Current Weight
                </Typography>
                <Typography variant="h4" color="primary">
                  {latestEntry ? `${latestEntry.weight} kg` : 'No data'}
                </Typography>
                {latestEntry && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(latestEntry.date).toLocaleDateString()}
                  </Typography>
                )}
                <Box sx={{ mt: 3 }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', minHeight: 200 }}>
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
                <Box sx={{ mt: 3 }} />
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', minHeight: 200 }}>
                <Person sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Height
                </Typography>
                <Typography variant="h4" color="info">
                  {currentHeight ? `${currentHeight} cm` : 'Not set'}
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    const height = prompt('Enter your height in cm:', currentHeight);
                    if (height && !isNaN(height) && height > 0) {
                      setCurrentHeight(height);
                      handleSaveHeight();
                    }
                  }}
                  sx={{ 
                    mt: 1,
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {currentHeight ? 'Edit' : 'Set Height'}
                  </Box>
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', minHeight: 200 }}>
                <ShowChart sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Waist Circumference
                </Typography>
                <Typography variant="h4" color="success">
                  {latestEntry?.waistCircumference ? `${latestEntry.waistCircumference} cm` : 'No data'}
                </Typography>
                {latestEntry?.waistCircumference && (
                  <Typography variant="body2" color="text.secondary">
                    {new Date(latestEntry.date).toLocaleDateString()}
                  </Typography>
                )}
                <Button
                  size="small"
                  onClick={() => {
                    const waistCircumference = prompt('Enter your waist circumference in cm:', currentWaistCircumference);
                    if (waistCircumference && !isNaN(waistCircumference) && waistCircumference > 0) {
                      setCurrentWaistCircumference(waistCircumference);
                      handleSaveWaistCircumference();
                    }
                  }}
                  sx={{ 
                    mt: 1,
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    {currentWaistCircumference ? 'Edit' : 'Set Waist'}
                  </Box>
                </Button>
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
                        formatter={(value, name) => [value, name === 'weight' ? 'Weight (kg)' : 'BMI']}
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
                        formatter={(value) => [value, 'Waist (cm)']}
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
                    const entryBMI = calculateBMI(entry.weight, entry.height || currentHeight);
                    const entryBMIInfo = entryBMI ? getBMICategory(entryBMI) : null;
                    
                    return (
                      <Paper key={entry.id} elevation={1} sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="h6">
                              {entry.weight} kg
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(entry.date).toLocaleDateString()}
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
                              {entry.height && (
                                <Chip 
                                  label={`Height: ${entry.height} cm`} 
                                  color="info"
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                              {entry.waistCircumference && (
                                <Chip 
                                  label={`Waist: ${entry.waistCircumference} cm`} 
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

        {/* Add Entry Dialog */}
        <Dialog open={isAddingEntry} onClose={() => setIsAddingEntry(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Enter Measurements</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={newEntry.weight}
                onChange={(e) => setNewEntry({...newEntry, weight: e.target.value})}
                inputProps={{ step: "0.1", min: "0" }}
              />
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={newEntry.height}
                onChange={(e) => setNewEntry({...newEntry, height: e.target.value})}
                inputProps={{ step: "0.1", min: "0" }}
                placeholder="Enter your height"
              />
              <TextField
                fullWidth
                label="Waist Circumference (cm)"
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
              {newEntry.weight && newEntry.height && (
                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    BMI for this entry: {calculateBMI(newEntry.weight, newEntry.height)}
                  </Typography>
                  {getBMICategory(calculateBMI(newEntry.weight, newEntry.height)) && (
                    <Chip 
                      label={getBMICategory(calculateBMI(newEntry.weight, newEntry.height)).category}
                      color={getBMICategory(calculateBMI(newEntry.weight, newEntry.height)).color}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setIsAddingEntry(false)}
              sx={{ 
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                Cancel
              </Box>
            </Button>
            <Button 
              onClick={handleSaveEntry} 
              variant="contained"
              sx={{ 
                minWidth: { xs: 'auto', sm: '64px' },
                px: { xs: 1, sm: 2 }
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                Save Entry
              </Box>
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
