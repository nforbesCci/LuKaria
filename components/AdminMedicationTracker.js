import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';

const AdminMedicationTracker = ({
  adminMedications,
  adminMedicationsLoading,
  adminMedicationsError,
  onGeneratePDF,
  formatDate,
}) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Medication Tracker</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => onGeneratePDF('Medication Tracker', 'medication-tracker-content')}
          sx={{ textTransform: 'none' }}
        >
          Generate PDF
        </Button>
      </Box>
      
      {adminMedicationsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading medication data...
          </Typography>
        </Box>
      ) : adminMedicationsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading medications: {adminMedicationsError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Medication Tracker - Last 4 Weeks
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Medication logs for the past 28 days
                </Typography>
                
                {adminMedications && adminMedications.length > 0 ? (
                  <Stack spacing={2}>
                    {adminMedications.map((medication, index) => (
                      <Box key={index} sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" color="primary">
                            {medication.medicationName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(medication.date)}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Dosage</Typography>
                            <Typography variant="body2">{medication.dosage || 'Not specified'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Frequency</Typography>
                            <Typography variant="body2">{medication.frequency || 'Not specified'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Time</Typography>
                            <Typography variant="body2">{medication.time || 'Not specified'}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Status</Typography>
                            <Chip 
                              label={medication.taken ? 'Taken' : 'Missed'} 
                              color={medication.taken ? 'success' : 'error'}
                              size="small"
                            />
                          </Grid>
                        </Grid>
                        
                        {medication.notes && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Notes</Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              {medication.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No medication logs found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No medication entries were recorded in the last 4 weeks.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminMedicationTracker;
