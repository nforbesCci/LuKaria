import React, { useState } from 'react';
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
  Paper,
} from '@mui/material';
import { PictureAsPdf } from '@mui/icons-material';

const AdminSideEffects = ({
  adminSideEffects,
  adminSideEffectsLoading,
  adminSideEffectsError,
  onGeneratePDF,
  onReviewSideEffect,
  onOpenSideEffect,
  formatDate,
}) => {
  const [selectedSideEffect, setSelectedSideEffect] = useState(null);

  // Handle side effect selection
  const handleSideEffectClick = (sideEffect) => {
    setSelectedSideEffect(selectedSideEffect?._id === sideEffect._id ? null : sideEffect);
  };

  // Handle side effect review
  const handleReviewSideEffect = (sideEffectId) => {
    onReviewSideEffect(sideEffectId);
    // Update local state to reflect the change
    setSelectedSideEffect(prev => prev ? { ...prev, reviewed: true } : null);
  };

  // Handle side effect open (set complete to false)
  const handleOpenSideEffect = (sideEffectId) => {
    onOpenSideEffect(sideEffectId);
    // Update local state to reflect the change
    setSelectedSideEffect(prev => prev ? { ...prev, complete: false } : null);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Side Effects</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => onGeneratePDF('Side Effects', 'side-effects-content')}
          sx={{ textTransform: 'none' }}
        >
          Generate PDF
        </Button>
      </Box>
      
      {adminSideEffectsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading side effects data...
          </Typography>
        </Box>
      ) : adminSideEffectsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading side effects: {adminSideEffectsError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Side Effects - Last 4 Reports
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Click on any side effect to view detailed information
                </Typography>
                
                {adminSideEffects && adminSideEffects.length > 0 ? (
                  <Stack spacing={2}>
                    {adminSideEffects.map((sideEffect, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          p: 2, 
                          border: '1px solid', 
                          borderColor: selectedSideEffect?._id === sideEffect._id ? 'primary.main' : 'divider', 
                          borderRadius: 2,
                          backgroundColor: selectedSideEffect?._id === sideEffect._id ? 'primary.50' : 'background.paper',
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => handleSideEffectClick(sideEffect)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" color="primary">
                            {formatDate(sideEffect.createdAt)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={sideEffect.reviewed ? 'Reviewed' : 'Pending Review'} 
                              color={sideEffect.reviewed ? 'success' : 'warning'}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {selectedSideEffect?._id === sideEffect._id ? 'Selected' : 'Click to view details'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary">
                          {sideEffect.sideEffects?.length > 0 
                            ? `${sideEffect.sideEffects.length} side effect(s) reported`
                            : 'No specific side effects listed'
                          }
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No side effects found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No side effects have been reported recently.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Fixed Details Panel */}
          {selectedSideEffect && (
            <Grid item xs={12}>
              <Card sx={{ 
                position: 'sticky', 
                bottom: 0, 
                zIndex: 1,
                backgroundColor: 'background.paper',
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      Side Effect Details - {formatDate(selectedSideEffect.createdAt)}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {!selectedSideEffect.reviewed && (
                        <Button 
                          variant="contained" 
                          color="success"
                          size="small" 
                          onClick={() => handleReviewSideEffect(selectedSideEffect._id)}
                        >
                          Mark as Reviewed
                        </Button>
                      )}
                      {selectedSideEffect.complete && (
                        <Button 
                          variant="contained" 
                          color="warning"
                          size="small" 
                          onClick={() => handleOpenSideEffect(selectedSideEffect._id)}
                        >
                          Reopen
                        </Button>
                      )}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => setSelectedSideEffect(null)}
                      >
                        Close Details
                      </Button>
                    </Box>
                  </Box>

                  {/* Review Status */}
                  <Box sx={{ mb: 3 }}>
                    <Chip 
                      label={selectedSideEffect.reviewed ? 'Reviewed' : 'Pending Review'} 
                      color={selectedSideEffect.reviewed ? 'success' : 'warning'}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {selectedSideEffect.reviewed ? 'This report has been reviewed' : 'This report is pending review'}
                    </Typography>
                  </Box>

                  {/* Report Information */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Report Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Report ID</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedSideEffect.reportId || 'Not available'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Report Date</Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {selectedSideEffect.reportDate ? formatDate(selectedSideEffect.reportDate) : 'Not available'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary">Status</Typography>
                        <Chip 
                          label={selectedSideEffect.complete ? 'Complete' : 'Incomplete'} 
                          color={selectedSideEffect.complete ? 'success' : 'warning'}
                          size="small"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Side Effects List */}
                  {selectedSideEffect.sideEffects && selectedSideEffect.sideEffects.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Reported Side Effects ({selectedSideEffect.sideEffects.length})
                      </Typography>
                      <Stack spacing={2}>
                        {selectedSideEffect.sideEffects.map((effect, effectIndex) => (
                          <Paper key={effectIndex} elevation={1} sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              {effect.name || 'Unnamed Side Effect'}
                            </Typography>
                            {effect.severity && (
                              <Chip 
                                label={`Severity: ${effect.severity}`} 
                                color={effect.severity === 'Mild' ? 'success' : effect.severity === 'Moderate' ? 'warning' : 'error'}
                                size="small"
                                sx={{ mb: 1 }}
                              />
                            )}
                            {effect.description && (
                              <Typography variant="body2" color="text.secondary">
                                {effect.description}
                              </Typography>
                            )}
                            {effect.duration && (
                              <Typography variant="caption" color="text.secondary">
                                Duration: {effect.duration}
                              </Typography>
                            )}
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        No Specific Side Effects Listed
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This report was submitted but no specific side effects were detailed.
                      </Typography>
                    </Box>
                  )}

                  {/* Other Side Effect */}
                  {selectedSideEffect.otherSideEffect && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Other Side Effects
                      </Typography>
                      <Typography variant="body2">
                        {selectedSideEffect.otherSideEffect}
                      </Typography>
                    </Box>
                  )}

                  {/* Appetite Information */}
                  {selectedSideEffect.appetiteSuppressed && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Appetite Suppression
                      </Typography>
                      <Typography variant="body2">
                        {selectedSideEffect.appetiteSuppressed}
                      </Typography>
                    </Box>
                  )}

                  {/* Treatment Concerns */}
                  {selectedSideEffect.hasTreatmentConcerns && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Treatment Concerns
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Patient has treatment concerns: {selectedSideEffect.hasTreatmentConcerns}
                      </Typography>
                      {selectedSideEffect.treatmentConcerns && (
                        <Typography variant="body2">
                          <strong>Details:</strong> {selectedSideEffect.treatmentConcerns}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Doctor Contact Request */}
                  {selectedSideEffect.requestDoctorContact && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Doctor Contact Request
                      </Typography>
                      <Chip 
                        label="Patient requested doctor contact" 
                        color="info"
                        sx={{ mb: 1 }}
                      />
                      {selectedSideEffect.contactMessage && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Message:</strong> {selectedSideEffect.contactMessage}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Timestamps */}
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Report Date: {formatDate(selectedSideEffect.createdAt)}
                    </Typography>
                    {selectedSideEffect.updatedAt && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Last Updated: {formatDate(selectedSideEffect.updatedAt)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default AdminSideEffects;
