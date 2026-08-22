'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { PictureAsPdf, Close } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';

const METRICS = [
  { id: 'bmi', label: 'BMI' },
  { id: 'weight', label: 'Weight' },
  { id: 'fat', label: 'Body fat %' },
  { id: 'bmr', label: 'BMR' },
];

const formatValue = (value, suffix = '') => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (Number.isFinite(n)) {
    const rounded = Math.round(n * 10) / 10;
    return `${rounded}${suffix}`;
  }
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

const chartLabel = (value, formatDate) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) {
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
  } catch {
    // fall through
  }
  return formatWhen(value, formatDate).slice(0, 10);
};

const isSuccessful = (scan) =>
  scan?.status === 'successful' || scan?.measurement?.status === 'successful';

const metricValue = (scan, metric) => {
  const m = scan?.measurement || {};
  switch (metric) {
    case 'bmi': {
      const v = m.bmi ?? m.estimated_bmi;
      return v == null || v === '' ? null : Number(v);
    }
    case 'weight': {
      const v = m.weight ?? m.estimated_weight ?? scan.weightKg;
      return v == null || v === '' ? null : Number(v);
    }
    case 'fat': {
      const v = m.fat_percentage;
      return v == null || v === '' ? null : Number(v);
    }
    case 'bmr': {
      const v = m.bmr ?? m.estimated_bmr;
      return v == null || v === '' ? null : Number(v);
    }
    default:
      return null;
  }
};

const metricUnit = (metric) => {
  switch (metric) {
    case 'weight':
      return 'kg';
    case 'fat':
      return '%';
    case 'bmr':
      return '';
    default:
      return '';
  }
};

/** Resolve lean/fat mass: primary → estimated → weight × fat %. */
const resolveBodyMass = (measurement, scanWeightKg) => {
  const m = measurement || {};
  const toNum = (v) => {
    if (v == null || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  let lean = toNum(m.lean_body_mass ?? m.estimated_lean_body_mass);
  let fat = toNum(m.fat_body_mass ?? m.estimated_fat_body_mass);

  if (lean == null || fat == null) {
    const weight = toNum(m.weight ?? m.estimated_weight ?? scanWeightKg);
    const fatPct = toNum(m.fat_percentage);
    if (weight != null && fatPct != null) {
      const derivedFat = (weight * fatPct) / 100;
      const derivedLean = weight - derivedFat;
      if (fat == null) fat = derivedFat;
      if (lean == null) lean = derivedLean;
    }
  }

  return { lean, fat };
};

const AdminBodyScan = ({
  adminBodyScans,
  adminBodyScansLoading,
  adminBodyScansError,
  onGeneratePDF,
  formatDate,
}) => {
  const scans = Array.isArray(adminBodyScans) ? adminBodyScans : [];
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [chartMetric, setChartMetric] = useState('bmi');

  const selectedScan = useMemo(
    () =>
      scans.find(
        (s) => (s.measurementId || s.createdAt) === selectedScanId,
      ) || null,
    [scans, selectedScanId],
  );

  const chartData = useMemo(() => {
    const successful = scans.filter(isSuccessful).slice().reverse();
    return successful
      .map((scan) => {
        const value = metricValue(scan, chartMetric);
        if (value == null || Number.isNaN(value)) return null;
        return {
          label: chartLabel(scan.createdAt || scan.completedAt, formatDate),
          value,
          fullDate: formatWhen(scan.createdAt || scan.completedAt, formatDate),
        };
      })
      .filter(Boolean);
  }, [scans, chartMetric, formatDate]);

  const selectedMetric = METRICS.find((m) => m.id === chartMetric) || METRICS[0];

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
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Progress
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={chartMetric}
                onChange={(_, next) => {
                  if (next) setChartMetric(next);
                }}
                sx={{ mb: 2, flexWrap: 'wrap' }}
              >
                {METRICS.map((m) => (
                  <ToggleButton key={m.id} value={m.id}>
                    {m.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              {chartData.length >= 2 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis
                      domain={['auto', 'auto']}
                      unit={metricUnit(chartMetric) ? ` ${metricUnit(chartMetric)}` : undefined}
                    />
                    <RechartsTooltip
                      formatter={(value) => [
                        formatValue(value, metricUnit(chartMetric) ? ` ${metricUnit(chartMetric)}` : ''),
                        selectedMetric.label,
                      ]}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.fullDate || ''}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#1976d2"
                      strokeWidth={2}
                      name={selectedMetric.label}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {chartData.length === 1
                    ? 'One successful scan so far — add another to graph progress.'
                    : 'Need at least two successful scans with this metric to show a chart.'}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Box>
            <Typography variant="h6" gutterBottom>
              Scans
            </Typography>
            {scans.length === 0 ? (
              <Typography color="text.secondary">No body scans yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {scans.map((scan) => {
                  const result = scan.measurement || {};
                  const ok = isSuccessful(scan);
                  const failed = (scan.status || result.status) === 'failed';
                  const id = scan.measurementId || scan.createdAt;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={id}>
                      <Card
                        variant="outlined"
                        sx={{
                          height: '100%',
                          opacity: failed ? 0.7 : 1,
                          borderColor: ok ? 'success.light' : failed ? 'error.light' : 'divider',
                        }}
                      >
                        <CardActionArea onClick={() => setSelectedScanId(id)} sx={{ height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ flex: 1 }}>
                                {formatWhen(scan.createdAt || scan.completedAt, formatDate)}
                              </Typography>
                              <Chip
                                size="small"
                                label={scan.status || result.status || 'unknown'}
                                color={ok ? 'success' : failed ? 'error' : 'default'}
                              />
                            </Stack>
                            <Typography variant="h5" color="primary">
                              BMI {formatValue(result.bmi ?? result.estimated_bmi)}
                            </Typography>
                            <Typography variant="h6" color="secondary">
                              Fat {formatValue(result.fat_percentage, '%')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              Weight{' '}
                              {formatValue(
                                result.weight ?? result.estimated_weight ?? scan.weightKg,
                                ' kg',
                              )}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </Box>
        </Stack>
      )}

      <Dialog
        open={Boolean(selectedScan)}
        onClose={() => setSelectedScanId(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedScan && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              Scan detail
              <IconButton
                aria-label="close"
                onClick={() => setSelectedScanId(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <ScanDetailBody scan={selectedScan} formatDate={formatDate} />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedScanId(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

function ScanDetailBody({ scan, formatDate }) {
  const result = scan.measurement || {};
  const circ = result.circumference_params || {};
  const failed = (scan.status || result.status) === 'failed';
  const { lean, fat } = resolveBodyMass(result, scan.weightKg);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle1">
          {formatWhen(scan.createdAt || scan.completedAt, formatDate)}
        </Typography>
        <Chip
          size="small"
          label={scan.status || result.status || 'unknown'}
          color={
            isSuccessful(scan) ? 'success' : failed ? 'error' : 'default'
          }
        />
      </Stack>
      <Typography variant="body2">Height: {formatValue(scan.heightCm ?? result.height, ' cm')}</Typography>
      <Typography variant="body2">Gender: {scan.gender || result.gender || '—'}</Typography>
      <Typography variant="body2">Age: {formatValue(scan.age ?? result.age)}</Typography>
      <Typography variant="body2">BMI: {formatValue(result.bmi ?? result.estimated_bmi)}</Typography>
      <Typography variant="body2">Body fat %: {formatValue(result.fat_percentage, '%')}</Typography>
      <Typography variant="body2">
        Weight:{' '}
        {formatValue(result.weight ?? result.estimated_weight ?? scan.weightKg, ' kg')}
      </Typography>
      <Typography variant="body2">BMR: {formatValue(result.bmr ?? result.estimated_bmr)}</Typography>
      <Typography variant="body2">Lean mass: {formatValue(lean, ' kg')}</Typography>
      <Typography variant="body2">Fat mass: {formatValue(fat, ' kg')}</Typography>

      {Object.keys(circ).length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Circumference
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(circ).map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Typography variant="caption" color="text.secondary">
                  {key.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2">{formatValue(value)}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {failed && Array.isArray(result.errors) && result.errors.length > 0 && (
        <Alert severity="warning">
          {result.errors
            .map((e) => e.detail || e.description)
            .filter(Boolean)
            .join('; ')}
        </Alert>
      )}
    </Stack>
  );
}

export default AdminBodyScan;
