'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { saveMeasurements, fetchMeasurements, clearSaveStatus } from '../store/slices/measurementsSlice';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Chip,
  Tooltip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Scale,
  Height,
  Info,
  Save,
} from '@mui/icons-material';

export default function WeightHeightEntry({ onComplete, onBack }) {
  console.log('📝 WeightHeightEntry: Component rendered/mounted');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const hasHandledSaveRef = React.useRef(false); // Track if we've handled a save in this mount
  
  const dispatch = useAppDispatch();
  const measurementsState = useAppSelector((state) => state.measurements);

  // Reset save state when component mounts to prevent auto-closing from previous save
  useEffect(() => {
    console.log('📊 Measurements: Component mounted, resetting save state...');
    hasHandledSaveRef.current = false;
    // Clear the isSaved flag to prevent auto-closing from a previous save
    dispatch(clearSaveStatus());
    dispatch(fetchMeasurements());
  }, [dispatch]); // Only run on mount

  // Handle measurements save success/failure - only trigger once per save
  useEffect(() => {
    if (measurementsState.isSaved && measurementsState.measurements && !hasHandledSaveRef.current) {
      console.log('✅ Measurements: Measurements saved successfully');
      hasHandledSaveRef.current = true; // Mark that we've handled this save
      // Refetch measurements to get the latest data
      dispatch(fetchMeasurements());
      onComplete(measurementsState.measurements);
    }
    if (measurementsState.error) {
      console.error('❌ Measurements: Error saving measurements:', measurementsState.error);
      alert(`Error saving measurements: ${measurementsState.error}`);
    }
  }, [measurementsState.isSaved, measurementsState.measurements, measurementsState.error, onComplete, dispatch]);

  // Load existing measurements data when fetched - always allow editing
  useEffect(() => {
    if (measurementsState.isLoaded && measurementsState.measurements && measurementsState.measurements.exists) {
      console.log('👤 Measurements: Loading existing measurements data from store:', measurementsState.measurements);
      
      const measurementsData = measurementsState.measurements.measurements;
      // Always update form with latest data - user can edit and save again
      setWeight(measurementsData.weight?.toString() || '');
      setHeightFeet(measurementsData.heightFeet?.toString() || '');
      setHeightInches(measurementsData.heightInches?.toString() || '');
      
      console.log('✅ Measurements: Form data updated with existing measurements (editable)');
    } else if (measurementsState.isLoaded && (!measurementsState.measurements || !measurementsState.measurements.exists)) {
      // Reset form if no measurements exist
      setWeight('');
      setHeightFeet('');
      setHeightInches('');
    }
  }, [measurementsState.isLoaded, measurementsState.measurements]);

  // Calculate BMI from pounds and feet/inches
  const calculateBMI = (weightLbs, feet, inches) => {
    if (!weightLbs || !feet || weightLbs <= 0 || feet <= 0) return null;
    
    // Convert feet and inches to total inches
    const totalInches = (parseInt(feet) * 12) + (parseInt(inches) || 0);
    
    // Convert to metric for BMI calculation
    const weightKg = weightLbs * 0.453592; // pounds to kg
    const heightM = totalInches * 0.0254; // inches to meters
    
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  // Get BMI category and color
  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    const bmiValue = parseFloat(bmi);
    
    if (bmiValue < 18.5) {
      return { category: 'Underweight', color: 'info', description: 'Below normal weight range' };
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      return { category: 'Normal weight', color: 'success', description: 'Healthy weight range' };
    } else if (bmiValue >= 25 && bmiValue < 30) {
      return { category: 'Overweight', color: 'warning', description: 'Above normal weight range' };
    } else {
      return { category: 'Obese', color: 'error', description: 'Significantly above normal weight range' };
    }
  };

  const currentBMI = calculateBMI(weight, heightFeet, heightInches);
  const bmiInfo = getBMICategory(currentBMI);

  const handleSave = () => {
    if (!weight || !heightFeet) {
      alert('Please enter both weight and height');
      return;
    }

    // Check if already saving
    if (measurementsState.isLoading) {
      console.log('⏳ Measurements: Already saving, please wait...');
      return;
    }

    console.log('🔄 Measurements: Dispatching save measurements saga with data:', {
      weight: parseFloat(weight),
      heightFeet: parseInt(heightFeet),
      heightInches: parseInt(heightInches) || 0,
      bmi: currentBMI,
      bmiCategory: bmiInfo?.category
    });
    
    // Dispatch the saga to save measurements to MongoDB
    dispatch(saveMeasurements({
      weight: parseFloat(weight),
      heightFeet: parseInt(heightFeet),
      heightInches: parseInt(heightInches) || 0,
      bmi: currentBMI,
      bmiCategory: bmiInfo?.category
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              Enter Measurements
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Please provide your current weight and height for your appointment
            </Typography>
          </Box>

          {/* Form */}
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Weight (lbs)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              inputProps={{ step: "0.1", min: "0" }}
              InputProps={{
                startAdornment: <Scale sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              placeholder="Enter your weight in pounds"
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Feet"
                type="number"
                value={heightFeet}
                onChange={(e) => setHeightFeet(e.target.value)}
                inputProps={{ min: "1", max: "8" }}
                InputProps={{
                  startAdornment: <Height sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                placeholder="5"
                sx={{ flex: 1 }}
              />
              <Typography variant="h6" color="text.secondary">
                ft
              </Typography>
              <TextField
                label="Inches"
                type="number"
                value={heightInches}
                onChange={(e) => setHeightInches(e.target.value)}
                inputProps={{ min: "0", max: "11" }}
                placeholder="6"
                sx={{ flex: 1 }}
              />
              <Typography variant="h6" color="text.secondary">
                in
              </Typography>
            </Box>

            {/* BMI Display */}
            {currentBMI && (
              <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" sx={{ mr: 1 }}>
                    BMI: {currentBMI}
                  </Typography>
                  {bmiInfo && (
                    <Chip 
                      label={bmiInfo.category} 
                      color={bmiInfo.color}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Tooltip 
                    title={
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          BMI Categories:
                        </Typography>
                        <Typography variant="body2">
                          • Underweight: Less than 18.5
                        </Typography>
                        <Typography variant="body2">
                          • Normal weight: 18.5 - 24.9
                        </Typography>
                        <Typography variant="body2">
                          • Overweight: 25.0 - 29.9
                        </Typography>
                        <Typography variant="body2">
                          • Obese: 30.0 and above
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <IconButton size="small">
                      <Info />
                    </IconButton>
                  </Tooltip>
                </Box>
                {bmiInfo && (
                  <Typography variant="body2" color="text.secondary">
                    {bmiInfo.description}
                  </Typography>
                )}
              </Box>
            )}

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your measurements will be securely stored and shared with your healthcare provider for your upcoming appointment.
              </Typography>
            </Alert>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={onBack}
                sx={{ textTransform: 'none', minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!weight || !heightFeet || measurementsState.isLoading}
                startIcon={<Save />}
                sx={{ textTransform: 'none', minWidth: 200 }}
                size="large"
              >
                {measurementsState.isLoading ? 'Saving...' : 'Save Measurements'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
