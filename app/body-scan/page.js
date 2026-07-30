'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useDispatch, useSelector } from 'react-redux';
import {
  createBodyScan,
  fetchBodyScans,
  clearBodyScanError,
  clearCurrentBodyScan,
} from '../../store/slices/bodyScanSlice';
import Header from '../../components/Header';
import PageTitle from '../../components/PageTitle';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { AccessibilityNew, CloudUpload, PhotoCamera } from '@mui/icons-material';

const LookCameraWidget = dynamic(() => import('../../components/LookCameraWidget'), {
  ssr: false,
});

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function formatLabel(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function CircumferenceGrid({ params }) {
  if (!params || typeof params !== 'object') return null;
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (!entries.length) return null;
  return (
    <Grid container spacing={1.5} sx={{ mt: 1 }}>
      {entries.map(([key, value]) => (
        <Grid item xs={6} sm={4} md={3} key={key}>
          <Box sx={{ p: 1.5, backgroundColor: 'rgba(135,116,73,0.12)', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatLabel(key)}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {typeof value === 'number' ? value : String(value)}
              {key !== 'body_type' && !Number.isNaN(Number(value)) ? ' cm' : ''}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default function BodyScanPage() {
  const { user, isLoading: authLoading } = useUser();
  useConsultationAccess();
  const dispatch = useDispatch();
  const bodyScan = useSelector((state) => state.bodyScan);

  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [gender, setGender] = useState('female');
  const [age, setAge] = useState('');
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [sidePhoto, setSidePhoto] = useState(null);
  const [frontPreview, setFrontPreview] = useState('');
  const [sidePreview, setSidePreview] = useState('');
  const [localError, setLocalError] = useState(null);
  const [cameraType, setCameraType] = useState(null);
  const [isTableFlow, setIsTableFlow] = useState(true);

  useEffect(() => {
    if (user) {
      dispatch(fetchBodyScans());
    }
  }, [user, dispatch]);

  const measurement = bodyScan.current?.measurement;
  const status = bodyScan.current?.status || measurement?.status;
  const busy = bodyScan.isSubmitting || bodyScan.isPolling;

  const applyPhoto = useCallback((which, dataUrl) => {
    if (!dataUrl) return;
    if (which === 'front') {
      setFrontPhoto(dataUrl);
      setFrontPreview(dataUrl);
    } else {
      setSidePhoto(dataUrl);
      setSidePreview(dataUrl);
    }
  }, []);

  const onPickPhoto = async (which, file) => {
    if (!file) return;
    setLocalError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      applyPhoto(which, dataUrl);
    } catch {
      setLocalError('Could not read that image. Try another photo.');
    }
  };

  const onSaveFront = useCallback(
    (image) => {
      applyPhoto('front', image);
      setCameraType(null);
      setLocalError(null);
    },
    [applyPhoto],
  );

  const onSaveSide = useCallback(
    (image) => {
      applyPhoto('side', image);
      setCameraType(null);
      setLocalError(null);
    },
    [applyPhoto],
  );

  const onTurnOffCamera = useCallback(() => {
    setCameraType(null);
  }, []);

  const onDisableTableFlow = useCallback(() => {
    setIsTableFlow(false);
    setLocalError(
      'Motion sensors unavailable — switched to friend-assisted capture. Or upload photos instead.',
    );
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearBodyScanError());

    if (!frontPhoto || !sidePhoto) {
      setLocalError('Front and side photos are required.');
      return;
    }
    const height = Number(heightCm);
    if (!height || height < 145 || height > 220) {
      setLocalError('Height must be between 145 and 220 cm.');
      return;
    }

    dispatch(
      createBodyScan({
        height,
        weight: weightKg === '' ? undefined : Number(weightKg),
        gender,
        age: age === '' ? undefined : Number(age),
        frontPhoto,
        sidePhoto,
      }),
    );
  };

  const onNewScan = () => {
    dispatch(clearCurrentBodyScan());
    setFrontPhoto(null);
    setSidePhoto(null);
    setFrontPreview('');
    setSidePreview('');
    setLocalError(null);
    setCameraType(null);
  };

  if (authLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <LookCameraWidget
        type={cameraType}
        isTableFlow={isTableFlow}
        onSaveFront={onSaveFront}
        onSaveSide={onSaveSide}
        onTurnOff={onTurnOffCamera}
        onDisableTableFlow={onDisableTableFlow}
      />
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <PageTitle
          title="Body Scan"
          subtitle="Use the 3DLOOK AI camera for guided front and side photos, then submit for FitXpress measurements."
        />

        {(localError || bodyScan.error) && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => {
            setLocalError(null);
            dispatch(clearBodyScanError());
          }}>
            {localError || bodyScan.error}
          </Alert>
        )}

        {busy && (
          <Alert severity="info" sx={{ mb: 2 }} icon={<CircularProgress size={20} />}>
            {bodyScan.isSubmitting
              ? 'Uploading photos and starting your scan…'
              : 'Processing scan — this usually takes under a minute…'}
          </Alert>
        )}

        {status === 'successful' && measurement && (
          <Card sx={{ mb: 3, backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#877449' }}>
                  Scan results
                </Typography>
                <Chip label="Successful" color="success" size="small" />
              </Stack>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  ['BMI', measurement.bmi ?? measurement.estimated_bmi],
                  ['Body fat %', measurement.fat_percentage],
                  ['BMR', measurement.bmr ?? measurement.estimated_bmr],
                  ['Weight (kg)', measurement.weight ?? measurement.estimated_weight],
                  ['Lean mass (kg)', measurement.lean_body_mass],
                  ['Fat mass (kg)', measurement.fat_body_mass],
                ].map(([label, value]) => (
                  <Grid item xs={6} sm={4} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="h6">{value != null ? value : '—'}</Typography>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="subtitle1" sx={{ color: '#877449' }}>
                Circumferences
              </Typography>
              <CircumferenceGrid params={measurement.circumference_params} />
              {measurement.model_3d_url && (
                <Button
                  href={measurement.model_3d_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 2 }}
                  variant="outlined"
                >
                  Download 3D model
                </Button>
              )}
              <Button onClick={onNewScan} sx={{ mt: 2, ml: 1 }} variant="contained">
                New scan
              </Button>
            </CardContent>
          </Card>
        )}

        {status === 'failed' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Scan failed
            {measurement?.errors?.length
              ? `: ${measurement.errors.map((e) => e.detail || e.description).join('; ')}`
              : '. Check pose and lighting, then try again.'}
            <Button size="small" onClick={onNewScan} sx={{ ml: 1 }}>
              Try again
            </Button>
          </Alert>
        )}

        {(!status || status === 'pending' || status === 'in_progress') && (
          <Card sx={{ mb: 3, backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AccessibilityNew sx={{ color: '#877449' }} />
                <Typography variant="h6" sx={{ color: '#877449' }}>
                  New body scan
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wear form-fitting clothes. Prefer the AI camera for guided pose and lighting. Height is
                required in centimeters.
              </Typography>
              <Box component="form" onSubmit={onSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Height (cm)"
                      type="number"
                      required
                      fullWidth
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      inputProps={{ min: 145, max: 220 }}
                      disabled={busy}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Weight (kg, optional)"
                      type="number"
                      fullWidth
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      inputProps={{ min: 40, max: 200 }}
                      disabled={busy}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Gender"
                      fullWidth
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      disabled={busy}
                    >
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Age (optional)"
                      type="number"
                      fullWidth
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      inputProps={{ min: 16, max: 85 }}
                      disabled={busy}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isTableFlow}
                          onChange={(e) => setIsTableFlow(e.target.checked)}
                          disabled={busy}
                        />
                      }
                      label="Photograph myself (hands-free AI guide)"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Off = a friend takes your photos with the rear camera.
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      disabled={busy}
                      sx={{ minHeight: 56 }}
                      onClick={() => {
                        setLocalError(null);
                        setCameraType('front');
                      }}
                    >
                      {frontPreview ? 'Retake front (AI camera)' : 'AI camera — front'}
                    </Button>
                    {frontPreview && (
                      <Box
                        component="img"
                        src={frontPreview}
                        alt="Front preview"
                        sx={{ mt: 1, width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 1 }}
                      />
                    )}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      disabled={busy}
                      sx={{ minHeight: 56 }}
                      onClick={() => {
                        setLocalError(null);
                        setCameraType('side');
                      }}
                    >
                      {sidePreview ? 'Retake side (AI camera)' : 'AI camera — side'}
                    </Button>
                    {sidePreview && (
                      <Box
                        component="img"
                        src={sidePreview}
                        alt="Side preview"
                        sx={{ mt: 1, width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 1 }}
                      />
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#877449', mb: 1 }}>
                      Or upload from gallery
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      fullWidth
                      disabled={busy}
                    >
                      Upload front photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        capture="environment"
                        onChange={(e) => onPickPhoto('front', e.target.files?.[0])}
                      />
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUpload />}
                      fullWidth
                      disabled={busy}
                    >
                      Upload side photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        capture="environment"
                        onChange={(e) => onPickPhoto('side', e.target.files?.[0])}
                      />
                    </Button>
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy || !frontPhoto || !sidePhoto}
                  sx={{ mt: 3 }}
                >
                  {busy ? 'Scanning…' : 'Start body scan'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        <Card sx={{ backgroundColor: '#1a1a1a' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
              Previous scans
            </Typography>
            {bodyScan.isLoading && <CircularProgress size={24} />}
            {!bodyScan.isLoading && bodyScan.scans.length === 0 && (
              <Typography color="text.secondary">No scans yet.</Typography>
            )}
            <Stack spacing={1.5} divider={<Divider flexItem />}>
              {bodyScan.scans.map((scan) => (
                <Box key={scan.measurementId}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip size="small" label={scan.status || 'unknown'} />
                    <Typography variant="body2">
                      {scan.createdAt
                        ? new Date(scan.createdAt).toLocaleString()
                        : scan.measurementId}
                    </Typography>
                    {scan.measurement?.bmi != null && (
                      <Typography variant="body2" color="text.secondary">
                        BMI {scan.measurement.bmi}
                      </Typography>
                    )}
                    {scan.measurement?.circumference_params?.waist && (
                      <Typography variant="body2" color="text.secondary">
                        Waist {scan.measurement.circumference_params.waist} cm
                      </Typography>
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}
