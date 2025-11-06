import React, { useState, useRef } from 'react';
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
  userData,
}) => {
  const [selectedSideEffect, setSelectedSideEffect] = useState(null);
  const sideEffectCardRef = useRef(null);

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

  // Generate PDF for individual side effect card
  const generateSideEffectPDF = async () => {
    if (!selectedSideEffect) return;

    try {
      // Show loading message
      const loadingMessage = document.createElement('div');
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '50%';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translate(-50%, -50%)';
      loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      loadingMessage.style.color = 'white';
      loadingMessage.style.padding = '20px';
      loadingMessage.style.borderRadius = '8px';
      loadingMessage.style.zIndex = '9999';
      loadingMessage.style.fontFamily = 'Arial, sans-serif';
      loadingMessage.innerHTML = `Generating Side Effect PDF...<br><small>This may take a few moments</small>`;
      document.body.appendChild(loadingMessage);

      // Import jsPDF and html2canvas dynamically
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      // Add header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Side Effect Report', 105, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const userName = userData?.name || userData?.email || 'Unknown User';
      pdf.text(`User: ${userName}`, 105, 30, { align: 'center' });
      pdf.text(`Report Date: ${formatDate(selectedSideEffect.createdAt)}`, 105, 35, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

      // Find the card content element
      const cardElement = sideEffectCardRef.current;
      
      if (cardElement) {
        // Create a temporary container for the card content
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = '800px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.padding = '20px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.style.fontSize = '12px';
        tempContainer.style.lineHeight = '1.4';
        tempContainer.style.color = '#000000';
        
        // Clone the card content
        const clonedContent = cardElement.cloneNode(true);
        
        // Remove buttons from cloned content
        const buttons = clonedContent.querySelectorAll('button');
        buttons.forEach(btn => btn.remove());
        
        tempContainer.appendChild(clonedContent);
        document.body.appendChild(tempContainer);

        try {
          // Capture the content as canvas
          const canvas = await html2canvas(tempContainer, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: tempContainer.scrollWidth,
            height: tempContainer.scrollHeight,
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight,
          });

          // Calculate dimensions for A4
          const imgWidth = 170; // A4 width minus margins
          const pageHeight = 200; // A4 height minus margins for header
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // If content is too tall, scale it down
          if (imgHeight > pageHeight) {
            const scaleFactor = pageHeight / imgHeight;
            const scaledWidth = imgWidth * scaleFactor;
            const scaledHeight = pageHeight;
            const xOffset = (imgWidth - scaledWidth) / 2;
            
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20 + xOffset, 50, scaledWidth, scaledHeight);
          } else {
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 20, 50, imgWidth, imgHeight);
          }

        } finally {
          // Clean up temporary container
          document.body.removeChild(tempContainer);
        }
      } else {
        console.warn('Side effect card element not found');
        // Add a message to PDF if content not found
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Content not available', 105, 100, { align: 'center' });
      }

      // Remove loading message
      document.body.removeChild(loadingMessage);

      // Generate filename with user info and date
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Side-Effect-Report-${userName.replace(/[^a-zA-Z0-9]/g, '-')}-${dateStr}.pdf`;

      // Save the PDF
      pdf.save(fileName);

      // Show success message
      alert(`Side Effect PDF generated successfully: ${fileName}`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Remove loading message if it exists
      const loadingMessage = document.querySelector('div[style*="position: fixed"]');
      if (loadingMessage) {
        document.body.removeChild(loadingMessage);
      }
      alert('Error generating Side Effect PDF. Please try again.');
    }
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
                              label={sideEffect.reviewed ? 'Reviewed' : 
                                !sideEffect.complete ? 'Sent back to user' : 'Pending Review'} 
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
              <Card 
                ref={sideEffectCardRef}
                sx={{ 
                  position: 'sticky', 
                  bottom: 0, 
                  zIndex: 1,
                  backgroundColor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3
                }}
              >
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
                        <>
                          <Button 
                            variant="outlined" 
                            color="primary"
                            size="small" 
                            startIcon={<PictureAsPdf />}
                            onClick={generateSideEffectPDF}
                          >
                            Generate PDF
                          </Button>
                          <Button 
                            variant="contained" 
                            color="warning"
                            size="small" 
                            onClick={() => handleOpenSideEffect(selectedSideEffect._id)}
                          >
                            Reopen
                          </Button>
                        </>
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
