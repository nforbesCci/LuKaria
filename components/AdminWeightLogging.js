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
} from '@mui/material';
import { PictureAsPdf, Scale, TrendingUp } from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminWeightLogging = ({
  adminMeasurements,
  adminMeasurementsLoading,
  adminMeasurementsError,
  onGeneratePDF,
  formatDate,
}) => {
  // Helper function to format values, replacing null/undefined with 'N/E'
  const formatValue = (value, suffix = '') => {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') {
      return 'N/E';
    }
    return `${value}${suffix}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Weight Logging</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdf />}
          onClick={() => onGeneratePDF('Weight Logging', 'weight-logging-content')}
          sx={{ textTransform: 'none' }}
        >
          Generate PDF
        </Button>
      </Box>
      
      {adminMeasurementsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Loading measurement data...
          </Typography>
        </Box>
      ) : adminMeasurementsError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading measurements: {adminMeasurementsError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Scale sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Latest Weight
                </Typography>
                <Typography variant="h4" color="primary">
                  {adminMeasurements && adminMeasurements.length > 0 
                    ? formatValue(adminMeasurements[0].weight, ' lbs') 
                    : 'No data'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Latest BMI
                </Typography>
                <Typography variant="h4" color="secondary">
                  {adminMeasurements && adminMeasurements.length > 0 
                    ? formatValue(adminMeasurements[0].bmi) 
                    : 'No data'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Waist Circumference
                </Typography>
                <Typography variant="h4" color="success">
                  {adminMeasurements && adminMeasurements.length > 0 
                    ? formatValue(adminMeasurements[0].waistCircumference, ' cm') 
                    : 'No data'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Weight & BMI Progress Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weight & BMI Progress - Last 4 Weeks
                </Typography>
                {adminMeasurements && adminMeasurements.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={[...adminMeasurements].reverse()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <RechartsTooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#1976d2" strokeWidth={2} name="Weight (lbs)" />
                      <Line yAxisId="right" type="monotone" dataKey="bmi" stroke="#dc004e" strokeWidth={2} name="BMI" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No measurement data found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No measurements were recorded in the last 4 weeks.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Detailed Measurements List */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Measurements
                </Typography>
                {adminMeasurements && adminMeasurements.length > 0 ? (
                  <Stack spacing={2}>
                    {adminMeasurements.slice(0, 10).map((measurement, index) => (
                      <Box key={index} sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2,
                        backgroundColor: 'background.paper'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" color="primary">
                            {measurement.dateKey}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {measurement.time || 'No time recorded'}
                          </Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Weight</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatValue(measurement.weight, ' lbs')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">BMI</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatValue(measurement.bmi)}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Waist</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatValue(measurement.waistCircumference, ' cm')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <Typography variant="caption" color="text.secondary">Height</Typography>
                            <Typography variant="body2" fontWeight="medium">
                              {formatValue(measurement.heightFeet,' feet') +' ' + formatValue(measurement.heightInches, ' inches') }
                            </Typography>
                          </Grid>
                        </Grid>
                        
                        {measurement.notes && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">Notes</Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              {measurement.notes}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No measurements found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No measurements were recorded in the last 4 weeks.
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

export default AdminWeightLogging;
