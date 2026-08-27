'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Grid,
  Stack,
  Switch,
  Typography,
  FormControlLabel,
} from '@mui/material';
import { CheckCircle, Flag } from '@mui/icons-material';
import dynamic from 'next/dynamic';
import {
  CORE_CIRC_KEYS,
  formatLabel,
  formatLength,
  formatMass,
  formatPercent,
  formatPlain,
  formatScanDate,
  photoDeletionDate,
  resolveBodyMassValues,
  toFiniteNumber,
} from '../lib/body-scan-display';

const BodyScanAvatar = dynamic(() => import('./BodyScanAvatar'), { ssr: false });

const sectionSx = {
  backgroundColor: '#fff',
  borderRadius: 2,
  border: '1px solid',
  borderColor: 'rgba(0,0,0,0.08)',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  p: { xs: 2, sm: 2.5 },
  mb: 2,
};

const headingSx = {
  color: '#1a3a6b',
  fontWeight: 700,
  fontSize: '1.15rem',
  mb: 2,
};

function Field({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: '#8a8f98', display: 'block', mb: 0.25, fontSize: '0.75rem' }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '1.05rem' }}>
        {value}
      </Typography>
    </Box>
  );
}

/**
 * FitXpress-style body-scan results: person info, status, estimated data,
 * body fat, core measurements, expandable additional measurements, 3D avatar.
 */
export default function BodyScanResults({
  measurement,
  scan = null,
  onNewScan = null,
  showAvatar = true,
  dense = false,
}) {
  const [units, setUnits] = useState('metric');
  const [showMore, setShowMore] = useState(false);

  const m = measurement || {};
  const circ = m.circumference_params || {};
  const frontLinear = m.front_linear_params || {};
  const sideLinear = m.side_linear_params || {};
  const volume = m.volume_params || {};
  const { lean, fat } = resolveBodyMassValues(m);

  const heightCm = toFiniteNumber(m.height) ?? toFiniteNumber(scan?.heightCm);
  const weightKg =
    toFiniteNumber(m.weight) ??
    toFiniteNumber(scan?.weightKg);
  const estimatedWeight = toFiniteNumber(m.estimated_weight);
  const bmi = toFiniteNumber(m.bmi) ?? toFiniteNumber(m.estimated_bmi);
  const estimatedBmi = toFiniteNumber(m.estimated_bmi);
  const age = toFiniteNumber(m.age) ?? toFiniteNumber(scan?.age);
  const gender = (m.gender || scan?.gender || '—').toString();
  const genderLabel = gender === '—' ? '—' : gender.charAt(0).toUpperCase() + gender.slice(1);

  const dateValue = m.created_at || scan?.createdAt || m.completed_at;
  const deletionDate = photoDeletionDate(m, scan);
  const statusOk =
    (m.status || scan?.status) === 'successful' ||
    (scan?.status === 'successful');

  const bust = circ.chest ?? circ.upper_chest_girth ?? circ.bust;
  const waist = circ.waist;
  const hips = circ.low_hips ?? circ.high_hips;

  const additionalCirc = useMemo(
    () =>
      Object.entries(circ).filter(
        ([k, v]) =>
          v != null &&
          v !== '' &&
          !CORE_CIRC_KEYS.includes(k) &&
          k !== 'body_type',
      ),
    [circ],
  );

  const additionalLinear = useMemo(() => {
    const entries = [];
    for (const [k, v] of Object.entries(frontLinear)) {
      if (v != null && v !== '') entries.push([`front_${k}`, v, 'cm']);
    }
    for (const [k, v] of Object.entries(sideLinear)) {
      if (v != null && v !== '') entries.push([`side_${k}`, v, 'cm']);
    }
    for (const [k, v] of Object.entries(volume)) {
      if (v != null && v !== '') entries.push([k, v, '']);
    }
    return entries;
  }, [frontLinear, sideLinear, volume]);

  const hasMore = additionalCirc.length > 0 || additionalLinear.length > 0 || circ.body_type;

  return (
    <Box
      sx={{
        backgroundColor: dense ? 'transparent' : '#f5f6f8',
        borderRadius: dense ? 0 : 2,
        p: dense ? 0 : { xs: 1.5, sm: 2 },
      }}
    >
      {/* Person information */}
      <Box sx={sectionSx}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={headingSx} mb={0}>
            Person information
          </Typography>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={units === 'imperial'}
                onChange={(_, checked) => setUnits(checked ? 'imperial' : 'metric')}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#1a3a6b', fontWeight: 600 }}>
                {units === 'imperial' ? 'Imperial' : 'Metric'}
              </Typography>
            }
            labelPlacement="start"
            sx={{ mr: 0, gap: 1 }}
          />
        </Stack>
        <Grid container spacing={2.5}>
          <Grid item xs={6} sm={4} md={2}>
            <Field label="Date" value={formatScanDate(dateValue)} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Field label="Gender" value={genderLabel} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Field label="Weight" value={formatMass(weightKg, units)} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Field label="Height" value={formatLength(heightCm, units)} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Field label="Age" value={age != null ? String(age) : '—'} />
          </Grid>
        </Grid>
      </Box>

      {/* Person ID Measurement status */}
      <Box sx={{ ...sectionSx, py: 1.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {statusOk ? (
              <CheckCircle sx={{ color: '#2e7d32' }} />
            ) : (
              <CheckCircle sx={{ color: '#9e9e9e' }} />
            )}
            <Typography sx={{ fontWeight: 600, color: '#333' }}>
              {statusOk ? 'Passed measurement successfully' : `Status: ${m.status || scan?.status || '—'}`}
            </Typography>
          </Stack>
          {deletionDate && (
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Flag sx={{ color: '#1a3a6b', fontSize: 18 }} />
              <Typography variant="body2" sx={{ color: '#555' }}>
                Photos will be completely deleted |{' '}
                {deletionDate.toLocaleDateString(undefined, {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Estimated body data */}
      <Box sx={sectionSx}>
        <Typography sx={headingSx}>Estimated body data</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={6} sm={3}>
            <Field
              label="Estimated weight"
              value={formatMass(estimatedWeight ?? weightKg, units)}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Field label="Estimated BMI" value={formatPlain(estimatedBmi ?? bmi)} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Field label="Estimated lean body mass" value={formatMass(lean, units)} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <Field label="Estimated fat body mass" value={formatMass(fat, units)} />
          </Grid>
        </Grid>
      </Box>

      {/* Body data */}
      <Box sx={sectionSx}>
        <Typography sx={headingSx}>Body data</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={6} sm={3}>
            <Field label="Fat" value={formatPercent(m.fat_percentage)} />
          </Grid>
          {(m.bmr != null || m.estimated_bmr != null) && (
            <Grid item xs={6} sm={3}>
              <Field label="BMR" value={formatPlain(m.bmr ?? m.estimated_bmr)} />
            </Grid>
          )}
          {bmi != null && (
            <Grid item xs={6} sm={3}>
              <Field label="BMI" value={formatPlain(bmi)} />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Core body measurements */}
      <Box sx={sectionSx}>
        <Typography sx={headingSx}>Core body measurements</Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={6} sm={4}>
            <Field label="Bust" value={formatLength(bust, units)} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Field label="Waist" value={formatLength(waist, units)} />
          </Grid>
          <Grid item xs={6} sm={4}>
            <Field label="Hips" value={formatLength(hips, units)} />
          </Grid>
          {circ.body_type && (
            <Grid item xs={6} sm={4}>
              <Field label="Body type" value={formatLabel(String(circ.body_type))} />
            </Grid>
          )}
        </Grid>

        {hasMore && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              onClick={() => setShowMore((v) => !v)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#1a3a6b' }}
            >
              {showMore ? 'Show less' : 'More'}
            </Button>
            <Collapse in={showMore}>
              <Box sx={{ mt: 2 }}>
                {additionalCirc.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ color: '#1a3a6b', mb: 1.5 }}>
                      Additional circumferences
                    </Typography>
                    <Grid container spacing={2}>
                      {additionalCirc.map(([key, value]) => (
                        <Grid item xs={6} sm={4} md={3} key={key}>
                          <Field
                            label={formatLabel(key)}
                            value={
                              key === 'body_type'
                                ? formatLabel(String(value))
                                : formatLength(value, units)
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}
                {additionalLinear.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#1a3a6b', mb: 1.5 }}>
                      Linear & volume measurements
                    </Typography>
                    <Grid container spacing={2}>
                      {additionalLinear.map(([key, value, kind]) => (
                        <Grid item xs={6} sm={4} md={3} key={key}>
                          <Field
                            label={formatLabel(key.replace(/^front_|^side_/, ''))}
                            value={
                              kind === 'cm'
                                ? formatLength(value, units)
                                : formatPlain(value)
                            }
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>

      {showAvatar && (
        <Box sx={{ mb: 2 }}>
          <BodyScanAvatar measurement={m} scan={scan} />
        </Box>
      )}

      {onNewScan && (
        <Button variant="contained" onClick={onNewScan} sx={{ mt: 1 }}>
          New scan
        </Button>
      )}
    </Box>
  );
}
