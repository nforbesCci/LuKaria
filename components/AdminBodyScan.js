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
  Divider,
} from '@mui/material';
import { PictureAsPdf, AccessibilityNew } from '@mui/icons-material';

const formatValue = (value, suffix = '') => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
};

const formatWhen = (value, formatDate) => {
  if (!value) return '—';
  try {
    return formatDate ? formatDate(value) : new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const AdminBodyScan = ({
  adminBodyScans,
  adminBodyScansLoading,
  adminBodyScansError,
  onGeneratePDF,
  formatDate,
}) => {
  const scans = Array.isArray(adminBodyScans) ? adminBodyScans : [];
  const latestSuccessful = scans.find(
    (s) => s.status === 'successful' || s.measurement?.status === 'successful',
  );
  const m = latestSuccessful?.measurement;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Body Scan</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => onGeneratePDF('Body Scan', 'body-scan-content')}
          sx={{ textTransform: 'none' }}
        >
          Generate PDF
        </Button>
      </Box>

      {adminBodyScansLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading body scan data...
          </Typography>
        </Box>
      ) : adminBodyScansError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading body scans: {adminBodyScansError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AccessibilityNew sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Latest BMI
                </Typography>
                <Typography variant="h4" color="primary">
                  {formatValue(m?.bmi ?? m?.estimated_bmi)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Body fat %
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatValue(m?.fat_percentage)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Weight (kg)
                </Typography>
                <Typography variant="h4">
                  {formatValue(m?.weight ?? m?.estimated_weight)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  BMR
                </Typography>
                <Typography variant="h4">
                  {formatValue(m?.bmr ?? m?.estimated_bmr)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Scan history
                </Typography>
                {scans.length === 0 ? (
                  <Typography color="text.secondary">No body scans yet.</Typography>
                ) : (
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {scans.map((scan) => {
                      const result = scan.measurement || {};
                      const circ = result.circumference_params || {};
                      const circPreview = Object.entries(circ)
                        .slice(0, 8)
                        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                        .join(' · ');
                      return (
                        <Box key={scan.measurementId || scan.createdAt}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="subtitle1">
                              {formatWhen(scan.createdAt || scan.completedAt, formatDate)}
                            </Typography>
                            <Chip
                              size="small"
                              label={scan.status || result.status || 'unknown'}
                              color={
                                (scan.status || result.status) === 'successful'
                                  ? 'success'
                                  : (scan.status || result.status) === 'failed'
                                    ? 'error'
                                    : 'default'
                              }
                            />
                          </Stack>
                          <Typography variant="body2" color="text.secondary">
                            Height {formatValue(scan.heightCm, ' cm')} · Weight{' '}
                            {formatValue(
                              result.weight ?? result.estimated_weight ?? scan.weightKg,
                              ' kg',
                            )}{' '}
                            · BMI {formatValue(result.bmi ?? result.estimated_bmi)} · Fat{' '}
                            {formatValue(result.fat_percentage, '%')} · BMR{' '}
                            {formatValue(result.bmr ?? result.estimated_bmr)}
                          </Typography>
                          {circPreview ? (
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {circPreview}
                            </Typography>
                          ) : null}
                          {(scan.status === 'failed' || result.status === 'failed') &&
                            Array.isArray(result.errors) &&
                            result.errors.length > 0 && (
                              <Alert severity="warning" sx={{ mt: 1 }}>
                                {result.errors
                                  .map((e) => e.detail || e.description)
                                  .filter(Boolean)
                                  .join('; ')}
                              </Alert>
                            )}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminBodyScan;
