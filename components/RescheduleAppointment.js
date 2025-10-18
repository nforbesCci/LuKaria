'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Paper,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  Email,
  Schedule,
  ArrowBack,
  Save
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useDispatch, useSelector } from 'react-redux';
import { adminRescheduleAppointment, setAdminRescheduleSuccess } from '../store/slices/appointmentSlice';

export default function RescheduleAppointment({ 
  request, 
  onReschedule,
  onBack
}) {
  const dispatch = useDispatch();
  const { isBooking, bookingError, adminRescheduleSuccess } = useSelector(state => state.appointment);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    date: null,
    time: null,
    type: 'consultation',
    length: '60',
    notes: ''
  });

  // Initialize form with current appointment data
  useEffect(() => {
    if (request) {
      setFormData({
        date: request.date ? new Date(request.date) : null,
        time: request.time ? new Date(`2000-01-01T${request.time}`) : null,
        type: request.type || 'consultation',
        length: request.length || '60',
        notes: ''
      });
      setSuccess(false);
    }
  }, [request]);

  // Handle success from Redux state
  useEffect(() => {
    if (adminRescheduleSuccess) {
      setSuccess(true);
      setTimeout(() => {
        onReschedule && onReschedule(adminRescheduleSuccess);
      }, 2000);
    }
  }, [adminRescheduleSuccess, onReschedule]);

  // Clear success state when component mounts
  useEffect(() => {
    // Reset any existing success state when component loads
    // This prevents the component from immediately triggering success
    dispatch(setAdminRescheduleSuccess(false));
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReschedule = () => {
    if (!formData.date || !formData.time) {
      return;
    }

    const appointmentData = {
      date: formData.date.toISOString(),
      time: formData.time.toTimeString().slice(0, 5),
      type: formData.type,
      length: formData.length,
      notes: formData.notes,
      rescheduleRequestId: request._id
    };

    dispatch(adminRescheduleAppointment(request.userId, appointmentData));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Button
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{ 
                color: '#877449',
                mr: 2,
                '&:hover': {
                  backgroundColor: 'rgba(135, 116, 73, 0.04)'
                }
              }}
            >
              Back to Requests
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Schedule sx={{ mr: 1, color: '#877449' }} />
              <Typography variant="h4" sx={{ color: '#877449', fontWeight: '600' }}>
                Reschedule Appointment
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ borderColor: '#877449' }} />
        </Box>

        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent sx={{ p: 3 }}>
          {request && (
            <>
              {/* Patient Information */}
              <Paper sx={{ p: 2, mb: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" sx={{ color: '#877449', mb: 2 }}>
                  Patient Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                      <Typography variant="body1">
                        {request.userName || 'Name not available'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Email sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {request.userEmail || 'Email not available'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                      <Typography variant="body2">
                        Current: {formatDate(request.date)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                      <Typography variant="body2">
                        {request.time || 'Time not specified'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              <Divider sx={{ mb: 3 }} />

              {/* Reschedule Form */}
              <Typography variant="h6" sx={{ color: '#877449', mb: 2 }}>
                New Appointment Details
              </Typography>

               {bookingError && (
                 <Alert severity="error" sx={{ mb: 2 }}>
                   {bookingError}
                 </Alert>
               )}

              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Appointment rescheduled successfully!
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="New Date"
                    value={formData.date}
                    onChange={(newValue) => handleInputChange('date', newValue)}
                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TimePicker
                    label="New Time"
                    value={formData.time}
                    onChange={(newValue) => handleInputChange('time', newValue)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        variant="outlined"
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Appointment Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      label="Appointment Type"
                    >
                      <MenuItem value="consultation">Consultation</MenuItem>
                      <MenuItem value="review">Review</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Duration</InputLabel>
                    <Select
                      value={formData.length}
                      onChange={(e) => handleInputChange('length', e.target.value)}
                      label="Duration"
                    >
                      <MenuItem value="15">15 minutes</MenuItem>
                      <MenuItem value="30">30 minutes</MenuItem>
                      <MenuItem value="45">45 minutes</MenuItem>
                      <MenuItem value="60">60 minutes</MenuItem>
                      <MenuItem value="90">90 minutes</MenuItem>
                      <MenuItem value="120">120 minutes</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    multiline
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    variant="outlined"
                    placeholder="Add any additional notes for this appointment..."
                  />
                </Grid>
              </Grid>
            </>
          )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2, 
          mt: 3,
          p: 3,
          backgroundColor: '#f8f9fa',
          borderRadius: 1
        }}>
           <Button
             onClick={onBack}
             disabled={isBooking}
             sx={{ 
               color: '#877449',
               textTransform: 'none',
               fontWeight: '600'
             }}
           >
             Cancel
           </Button>
           <Button
             onClick={handleReschedule}
             variant="contained"
             disabled={isBooking || !formData.date || !formData.time}
             startIcon={isBooking ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Save />}
             sx={{
               backgroundColor: '#877449',
               color: 'white',
               textTransform: 'none',
               fontWeight: '600',
               px: 3,
               py: 1.5,
               '&:hover': {
                 backgroundColor: '#B8941F',
               },
               '&:disabled': {
                 backgroundColor: '#ccc',
                 color: '#666'
               }
             }}
           >
             {isBooking ? 'Rescheduling...' : 'Reschedule Appointment'}
           </Button>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}
