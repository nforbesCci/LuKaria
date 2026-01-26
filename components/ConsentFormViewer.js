'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import {
  Close,
  Print,
  Download
} from '@mui/icons-material';

const ConsentFormViewer = ({ 
  open, 
  onClose, 
  formType, 
  formData, 
  formatDateTime,
  inline = false
}) => {
  if (!formData) return null;

  const renderFormContent = () => {
    switch (formType) {
      case 'telehealth':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Telehealth Consent Form
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              I understand that my healthcare provider wishes me to engage in a telehealth appointment.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              I understand that the video conferencing technology that will be used to affect such an appointment will not be the same as a direct client/health care provider visit due to the fact that I will not be in the same room as my provider.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              I understand that a telehealth consultation has potential benefits including easier access to care and the convenience of meeting from a location of my choosing.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              I understand there are potential risks to this technology, including interruptions, unauthorized access, and technical difficulties. I understand that my health care provider or I can discontinue the telehealth consult/visit if it is felt that the videoconferencing connections are not adequate for the situation.
            </Typography>
          </Box>
        );

      case 'photograph':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Photograph Consent Form
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Before and after photographs are important proofs of the success of your program. Many patients who are contemplating whether a weight loss program might be right for them find photographs useful. Images, including before and after photos, may be used for patient education and for advertising.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Svelte by LuKaria will only use your photographs if you have given permission to do so. Names are not used, and identifying factors are masked when requested. These photos are stored in a secure server in compliance with Jamaica's Data Protection Act. They will be accessed by clinic staff and will not be sold or transferred to any other entity for purposes that have not been agreed to.
            </Typography>
          </Box>
        );

      case 'mounjaro':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Mounjaro Consent Form
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Purpose of Treatment:</strong><br />
              Mounjaro is a human-based glucagon-like peptide-1 receptor agonist and Glucose Dependent Insulinotropic Polypeptide (GIP) receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Mounjaro is FDA approved for the management of Type 2 Diabetes, and is used off label for weight management in non-diabetic patients who are overweight or obese. It works by increasing insulin production and lowers glucagon secretion as well as targets areas in the brain that regulate appetite and food intake. Mounjaro also assists the body to store fat more efficiently.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Do not take Mounjaro if:</strong><br />
              • You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)<br />
              • Multiple Endocrine Neoplasia syndrome type 2<br />
              • You are pregnant or plan to become pregnant while taking this medicine<br />
              • You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist
            </Typography>
          </Box>
        );

      case 'semaglutide':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Semaglutide Consent Form
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Purpose of Treatment:</strong><br />
              Semaglutide is a human-based glucagon-like peptide-1 receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Semaglutide is FDA approved for the management of Type 2 Diabetes, and is used off label for weight management in non-diabetic patients who are overweight or obese. These medicines work by slowing gastric emptying time and stimulating the satiety center in the brain to reduce hunger and appetite.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              <strong>Do not take Semaglutide if:</strong><br />
              • You have a personal or family history of medullary thyroid carcinoma (Thyroid Cancer)<br />
              • Multiple Endocrine Neoplasia syndrome type 2<br />
              • You are pregnant or plan to become pregnant while taking this medicine<br />
              • You are diabetic and/or taking any medications related to lowering your blood sugar levels without speaking with your endocrinologist
              • You have a history of Pancreatitis<br />
              • You are allergic to Semaglutide or any other GLP-1 agonist such as: Adlyxin®, Byeta®, Bydureon®, Rybelsus®,Trulicity®, Victoza®, or Wegovy®<br />
            </Typography>
          </Box>
        );

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Form content not available
          </Typography>
        );
    }
  };

  const renderPatientInfo = () => {
    if (!formData.patientName && !formData.patientDOB && !formData.consentDate) {
      return null;
    }

    return (
      <Card elevation={1} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Patient Information
        </Typography>
        <Grid container spacing={2}>
          {formData.patientName && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Patient Name:</strong> {formData.patientName}
              </Typography>
            </Grid>
          )}
          {formData.patientDOB && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Date of Birth:</strong> {formData.patientDOB}
              </Typography>
            </Grid>
          )}
          {formData.consentDate && (
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Consent Date:</strong> {formData.consentDate}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Card>
    );
  };

  const renderPermissions = () => {
    if (formType !== 'photograph' || !formData.permissions) {
      return null;
    }

    return (
      <Card elevation={1} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Photography Usage Permissions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>To educate other patients within our practice:</strong> {formData.permissions.educatePatients ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>To educate patients on our website:</strong> {formData.permissions.educateWebsite ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              <strong>To educate patients on our social media accounts:</strong> {formData.permissions.educateSocialMedia ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          {formData.specialRequests && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                <strong>Special Requests:</strong><br />
                {formData.specialRequests}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Card>
    );
  };

  const renderSignature = () => {
    if (!formData.signature) {
      return null;
    }

    return (
      <Card elevation={1} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" gutterBottom>
          Patient Signature
        </Typography>
        <Box sx={{ textAlign: 'center' }}>
          <img 
            src={formData.signature} 
            alt="Patient Signature" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }} 
          />
        </Box>
      </Card>
    );
  };

  // If inline mode, render without dialog wrapper
  if (inline) {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={formData.available ? 'Enabled' : 'Disabled'} 
              color={formData.available ? 'success' : 'default'}
              size="small"
            />
            {formData.locked && (
              <Chip 
                label="Locked" 
                color="warning"
                size="small"
              />
            )}
            {formData.complete && (
              <Chip 
                label="Completed" 
                color="success"
                size="small"
              />
            )}
          </Box>
          
          {formData.createdAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Created: {formatDateTime ? formatDateTime(formData.createdAt) : formData.createdAt}
            </Typography>
          )}
          
          {formData.updatedAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Updated: {formatDateTime ? formatDateTime(formData.updatedAt) : formData.updatedAt}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Form Content */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: '#f5f5f5',
            mb: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {renderFormContent()}
        </Paper>

        {/* Patient Information */}
        {renderPatientInfo()}

        {/* Permissions (for photograph consent) */}
        {renderPermissions()}

        {/* Signature */}
        {renderSignature()}
      </Box>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="div">
            {formType?.charAt(0).toUpperCase() + formType?.slice(1)} Consent Form
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" color="primary">
              <Print />
            </IconButton>
            <IconButton size="small" color="primary">
              <Download />
            </IconButton>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip 
              label={formData.available ? 'Enabled' : 'Disabled'} 
              color={formData.available ? 'success' : 'default'}
              size="small"
            />
            {formData.locked && (
              <Chip 
                label="Locked" 
                color="warning"
                size="small"
              />
            )}
            {formData.complete && (
              <Chip 
                label="Completed" 
                color="success"
                size="small"
              />
            )}
          </Box>
          
          {formData.createdAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Created: {formatDateTime ? formatDateTime(formData.createdAt) : formData.createdAt}
            </Typography>
          )}
          
          {formData.updatedAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Updated: {formatDateTime ? formatDateTime(formData.updatedAt) : formData.updatedAt}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Form Content */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            backgroundColor: '#f5f5f5',
            mb: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {renderFormContent()}
        </Paper>

        {/* Patient Information */}
        {renderPatientInfo()}

        {/* Permissions (for photograph consent) */}
        {renderPermissions()}

        {/* Signature */}
        {renderSignature()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConsentFormViewer;
