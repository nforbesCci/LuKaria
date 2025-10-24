'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

const AdminConsentForms = ({
  consentForms,
  consentFormsLoading,
  consentFormsError,
  onToggleConsentForm,
  onUnlockConsentForm,
  onViewConsentForm,
  formatDateTime
}) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Consent Forms Management
            </Typography>
            
            {consentFormsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  Loading consent forms...
                </Typography>
              </Box>
            ) : consentFormsError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                Error loading consent forms: {consentFormsError}
              </Alert>
            ) : !consentForms || Object.keys(consentForms).length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                No consent forms found for this user.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {Object.entries(consentForms).map(([formType, form]) => (
                  <Grid item xs={12} md={6} lg={4} key={formType}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                          {formType.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {form && (
                            <>
                               <Chip
                                 label={form.available ? 'Enabled' : 'Disabled'} 
                                 color={form.available ? 'success' : 'default'}
                                 size="small"
                               />
                              {form.locked && (
                                <Chip 
                                  label="Locked" 
                                  color="warning"
                                  size="small"
                                />
                              )}
                              {form.complete && (
                                <Chip 
                                  label="Completed" 
                                  color="success"
                                  size="small"
                                />
                              )}
                            </>
                          )}
                        </Box>
                      </Box>
                      
                      {form ? (
                        <>
                           <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                             Status: {form.available ? 'Active' : 'Inactive'}
                           </Typography>
                           
                           {/* Debug: Show form properties */}
                           <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                             Debug: locked={String(form.locked)}, complete={String(form.complete)}
                           </Typography>
                          
                          {form.createdAt && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Created: {formatDateTime(form.createdAt)}
                            </Typography>
                          )}
                          
                          {form.updatedAt && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Updated: {formatDateTime(form.updatedAt)}
                            </Typography>
                          )}
                          
                          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                             <Button
                               variant="outlined"
                               size="small"
                               color="primary"
                               onClick={() => onViewConsentForm(formType, form)}
                             >
                               View
                             </Button>
                             <Button
                               variant={form.available ? "outlined" : "contained"}
                               size="small"
                               color={form.available ? "error" : "success"}
                               onClick={() => onToggleConsentForm(formType, !form.available)}
                             >
                               {form.available ? 'Disable' : 'Enable'}
                             </Button>
                            
                            {form.locked && (
                              <Button
                                variant="outlined"
                                size="small"
                                color="warning"
                                onClick={() => onUnlockConsentForm(formType)}
                              >
                                Unlock
                              </Button>
                            )}
                            
                            {form.complete && (
                              <Button
                                variant="outlined"
                                size="small"
                                color="info"
                                onClick={() => onUnlockConsentForm(formType)}
                              >
                                Unlock Complete
                              </Button>
                            )}
                            
                            {/* Test button - always show for debugging */}
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => {
                                console.log('Test button clicked for form:', formType, form);
                                onUnlockConsentForm(formType);
                              }}
                            >
                              Test Unlock
                            </Button>
                          </Box>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No {formType} consent form found
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default AdminConsentForms;
