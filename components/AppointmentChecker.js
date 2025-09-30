'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkAppointmentConfig } from '../store/slices/appointmentSlice';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Grid
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Cancel,
  Refresh,
  Info
} from '@mui/icons-material';

export default function AppointmentChecker() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  
  // Get current appointment state from Redux
  const currentAppointment = useSelector((state) => state.appointment.currentAppointment);
  const isScheduleCompleted = useSelector((state) => state.appointment.isScheduleCompleted);
  const bookingError = useSelector((state) => state.appointment.bookingError);

  const handleCheckAppointment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Dispatch the saga action to check appointment configuration
      dispatch(checkAppointmentConfig());
      setLastChecked(new Date().toLocaleString());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Appointment Configuration Checker
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This component checks the server's appointment configuration using environment variables.
      </Typography>

      {/* Check Button */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Check Server Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click the button below to check if an appointment is configured on the server.
          </Typography>
          
          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleCheckAppointment}
            disabled={isLoading}
            sx={{ mb: 2 }}
          >
            {isLoading ? 'Checking...' : 'Check Appointment Configuration'}
          </Button>
          
          {lastChecked && (
            <Typography variant="caption" display="block" color="text.secondary">
              Last checked: {lastChecked}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {(error || bookingError) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || bookingError}
        </Alert>
      )}

      {/* Current Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Chip
              icon={isScheduleCompleted ? <CheckCircle /> : <Cancel />}
              label={isScheduleCompleted ? 'Scheduled' : 'Not Scheduled'}
              color={isScheduleCompleted ? 'success' : 'default'}
              variant={isScheduleCompleted ? 'filled' : 'outlined'}
            />
            {currentAppointment?.source && (
              <Chip
                label={`Source: ${currentAppointment.source}`}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Appointment Details */}
      {currentAppointment && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Appointment Details
            </Typography>
            
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Provider
                  </Typography>
                  <Typography variant="body1">
                    {currentAppointment.provider || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Time
                  </Typography>
                  <Typography variant="body1">
                    {currentAppointment.time || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Length
                  </Typography>
                  <Typography variant="body1">
                    {currentAppointment.length ? `${currentAppointment.length} minutes` : 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Typography variant="body1">
                    {currentAppointment.type || 'N/A'}
                  </Typography>
                </Grid>
                
                {currentAppointment.scheduledAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Scheduled At
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentAppointment.scheduledAt).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
                
                {currentAppointment.checkedAt && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Last Checked
                    </Typography>
                    <Typography variant="body1">
                      {new Date(currentAppointment.checkedAt).toLocaleString()}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            How to Configure
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To configure an appointment, set these environment variables in your .env.local file:
          </Typography>
          <Box component="pre" sx={{ 
            backgroundColor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            mt: 2,
            fontSize: '0.75rem',
            overflow: 'auto'
          }}>
{`APPOINTMENT_SCHEDULED=true
APPOINTMENT_TIME=14:30
APPOINTMENT_LENGTH=60
APPOINTMENT_DATE=2024-01-15
APPOINTMENT_PROVIDER=Dr. Smith
APPOINTMENT_TYPE=consultation`}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
