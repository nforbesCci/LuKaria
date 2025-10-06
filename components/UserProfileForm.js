'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updatePersonalInfoAsync } from '../store/slices/userSlice';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';

export default function UserProfileForm() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, error } = useAppSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    dateOfBirth: profile.dateOfBirth || '',
    gender: profile.gender || '',
    address: profile.address || '',
    parish: profile.parish || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePersonalInfoAsync(formData));
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Update Personal Information
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
              disabled={isLoading}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              multiline
              rows={2}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Parish"
              name="parish"
              value={formData.parish}
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
              disabled={isLoading}
            >
              <option value="">Select Parish</option>
              <option value="Kingston">Kingston</option>
              <option value="St. Andrew">St. Andrew</option>
              <option value="St. Thomas">St. Thomas</option>
              <option value="Portland">Portland</option>
              <option value="St. Mary">St. Mary</option>
              <option value="St. Ann">St. Ann</option>
              <option value="Trelawny">Trelawny</option>
              <option value="St. James">St. James</option>
              <option value="Hanover">Hanover</option>
              <option value="Westmoreland">Westmoreland</option>
              <option value="St. Elizabeth">St. Elizabeth</option>
              <option value="Manchester">Manchester</option>
              <option value="Clarendon">Clarendon</option>
              <option value="St. Catherine">St. Catherine</option>
            </TextField>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            sx={{
              textTransform: 'none',
              backgroundColor: '#877449',
              '&:hover': {
                backgroundColor: '#B8941F',
              }
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

