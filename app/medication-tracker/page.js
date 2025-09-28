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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
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
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function MedicationTracker() {
  const { user, isLoading, error } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [medicationHistory, setMedicationHistory] = useState([]);
  const [currentMedications, setCurrentMedications] = useState([]);
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    medicationName: '',
    dosage: '',
    notes: ''
  });

  // Common medications list
  const commonMedications = [
    'Metformin',
    'Ozempic',
    'Wegovy',
    'Semaglutide',
    'Liraglutide',
    'Insulin',
    'Multivitamin',
    'Vitamin D',
    'Iron',
    'Calcium',
    'Other'
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load user's medication history and current medications from Auth0 metadata
  useEffect(() => {
    if (user) {
      // Load medication history from user metadata
      const savedHistory = user.user_metadata?.medication_history || [];
      setMedicationHistory(savedHistory);
      
      // Load current medications from user metadata
      const savedCurrentMedications = user.user_metadata?.current_medications_list || [];
      setCurrentMedications(savedCurrentMedications);
    }
  }, [user]);

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

    const entry = {
      ...newEntry,
      id: Date.now(),
      timestamp: new Date(`${newEntry.date}T${newEntry.time}`).getTime()
    };

    const updatedHistory = [...medicationHistory, entry];
    setMedicationHistory(updatedHistory);
    
    // Save to user metadata (in a real app, this would be an API call)
    console.log('Saving medication entry:', entry);
    console.log('Updated medication history:', updatedHistory);
    
    setIsAddingEntry(false);
    setNewEntry({ date: '', time: '', medicationName: '', dosage: '', notes: '' });
    alert('Medication entry saved successfully!');
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedHistory = medicationHistory.filter(entry => entry.id !== entryId);
      setMedicationHistory(updatedHistory);
      
      // Save to user metadata
      console.log('Deleted medication entry:', entryId);
      alert('Medication entry deleted successfully!');
    }
  };

  const handleAddCurrentMedication = () => {
    const medicationName = prompt('Enter medication name:');
    if (medicationName && medicationName.trim()) {
      const newMedication = {
        id: Date.now(),
        name: medicationName.trim(),
        dosage: '',
        frequency: 'As needed'
      };
      const updatedCurrent = [...currentMedications, newMedication];
      setCurrentMedications(updatedCurrent);
      
      // Save to user metadata
      console.log('Added current medication:', newMedication);
      alert('Medication added to current list!');
    }
  };

  const handleDeleteCurrentMedication = (medicationId) => {
    if (window.confirm('Are you sure you want to remove this medication?')) {
      const updatedCurrent = currentMedications.filter(med => med.id !== medicationId);
      setCurrentMedications(updatedCurrent);
      
      // Save to user metadata
      console.log('Removed current medication:', medicationId);
      alert('Medication removed from current list!');
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

        {/* Current Medications */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" component="h2">
                Current Medications
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddCurrentMedication}
                sx={{ 
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: '64px' },
                  px: { xs: 1, sm: 2 }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Add Medication
                </Box>
              </Button>
            </Box>
            
            {currentMedications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Medication sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No current medications
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your current medications to track them easily
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddCurrentMedication}
                  sx={{ 
                    textTransform: 'none',
                    minWidth: { xs: 'auto', sm: '64px' },
                    px: { xs: 1, sm: 2 }
                  }}
                >
                  <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                    Add First Medication
                  </Box>
                </Button>
              </Box>
            ) : (
              <List>
                {currentMedications.map((medication) => (
                  <ListItem key={medication.id} divider>
                    <ListItemText
                      primary={medication.name}
                      secondary={medication.dosage ? `Dosage: ${medication.dosage}` : 'No dosage specified'}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteCurrentMedication(medication.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

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
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start tracking your medications to see your intake patterns over time
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
                    Log First Entry
                  </Box>
                </Button>
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
                              label={`Dosage: ${entry.dosage}`} 
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

        {/* Add Entry Dialog */}
        <Dialog open={isAddingEntry} onClose={() => setIsAddingEntry(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Log Medication</DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Time"
                    type="time"
                    value={newEntry.time}
                    onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              
              <FormControl fullWidth>
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
                label="Dosage"
                value={newEntry.dosage}
                onChange={(e) => setNewEntry({...newEntry, dosage: e.target.value})}
                placeholder="e.g., 500mg, 1 tablet, 2 drops"
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

