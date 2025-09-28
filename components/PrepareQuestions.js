'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Stack,
  Checkbox,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  QuestionAnswer,
  Save,
} from '@mui/icons-material';

export default function PrepareQuestions({ onComplete, onBack }) {
  const [questions, setQuestions] = useState('');
  const [noQuestions, setNoQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved questions from user metadata
  useEffect(() => {
    // In a real app, this would load from the backend
    // For now, we'll use localStorage as a placeholder
    const savedQuestions = localStorage.getItem('appointmentQuestions');
    const savedNoQuestions = localStorage.getItem('noQuestionsFlag');
    
    if (savedQuestions) {
      setQuestions(savedQuestions);
    }
    if (savedNoQuestions === 'true') {
      setNoQuestions(true);
    }
  }, []);

  const handleNoQuestionsChange = (event) => {
    const checked = event.target.checked;
    setNoQuestions(checked);
    
    // Clear questions if "no questions" is checked
    if (checked) {
      setQuestions('');
    }
  };

  const handleQuestionsChange = (event) => {
    const value = event.target.value;
    setQuestions(value);
    
    // Uncheck "no questions" if user starts typing
    if (value.trim().length > 0) {
      setNoQuestions(false);
    }
  };

  const handleSave = async () => {
    if (!noQuestions && !questions.trim()) {
      alert('Please enter your questions or check "No questions at this time"');
      return;
    }

    setIsSaving(true);
    
    try {
      // In a real app, this would save to the backend
      console.log('Saving questions:', { 
        questions: noQuestions ? null : questions.trim(), 
        noQuestions,
        timestamp: new Date().toISOString()
      });
      
      // Save to localStorage as placeholder
      if (noQuestions) {
        localStorage.setItem('noQuestionsFlag', 'true');
        localStorage.removeItem('appointmentQuestions');
      } else {
        localStorage.setItem('appointmentQuestions', questions.trim());
        localStorage.removeItem('noQuestionsFlag');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark task as complete
      onComplete({
        questions: noQuestions ? null : questions.trim(),
        noQuestions,
        date: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving questions:', error);
      alert('Error saving questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <Card sx={{ width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom color="primary">
              Prepare Questions
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Write down any questions or concerns you'd like to discuss with your healthcare provider
            </Typography>
          </Box>

          {/* Form */}
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Questions for your appointment"
              multiline
              rows={8}
              value={questions}
              onChange={handleQuestionsChange}
              disabled={noQuestions}
              placeholder="Enter any questions or concerns you have about your treatment, side effects, lifestyle changes, or anything else you'd like to discuss..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: noQuestions ? 'grey.50' : 'white'
                }
              }}
              InputProps={{
                startAdornment: <QuestionAnswer sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 2 }} />
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={noQuestions}
                  onChange={handleNoQuestionsChange}
                  color="primary"
                />
              }
              label={
                <Typography variant="body1" color="text.secondary">
                  No questions at this time
                </Typography>
              }
              sx={{ 
                alignSelf: 'flex-start',
                '& .MuiFormControlLabel-label': {
                  fontWeight: noQuestions ? 'bold' : 'normal'
                }
              }}
            />

            {/* Info Alert */}
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your questions will be shared with your healthcare provider before your appointment so they can be prepared to address your concerns.
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
                disabled={isSaving}
                startIcon={<Save />}
                sx={{ textTransform: 'none', minWidth: 200 }}
                size="large"
              >
                {isSaving ? 'Saving...' : 'Save Questions'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
