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
import BodyScanResults from '../../components/BodyScanResults';
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
import { AccessibilityNew, PhotoCamera } from '@mui/icons-material';

const LookCameraWidget = dynamic(() => import('../../components/LookCameraWidget'), {
  ssr: false,
});

const EMPTY_HARD_VALIDATION = { front: null, side: null };

/** Map FitXpress pose errors into LookCamera hardValidation for guided retakes. */
function buildHardValidation(errors) {
  const hv = { front: null, side: null };
  if (!Array.isArray(errors) || errors.length === 0) return hv;
  for (const err of errors) {
    if (!err) continue;
    const source = String(err.error_source || err.source || '').toLowerCase();
    if (source === 'front_photo' || source === 'front') {
      hv.front = err;
    } else if (source === 'side_photo' || source === 'side') {
      hv.side = err;
    } else {
      // Pose / detection errors without a side — guide both captures
      hv.front = hv.front || err;
      hv.side = hv.side || err;
    }
  }
  return hv;
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
  const [viewedScan, setViewedScan] = useState(null);
  const [isTableFlow, setIsTableFlow] = useState(true);
  const [hardValidation, setHardValidation] = useState(EMPTY_HARD_VALIDATION);

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

  const openCamera = useCallback((which, validation = EMPTY_HARD_VALIDATION) => {
    setLocalError(null);
    setHardValidation(validation);
    setCameraType(which);
  }, []);

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
      'Motion sensors unavailable — switched to friend-assisted capture with real-time pose guidance.',
    );
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    setViewedScan(null);
    dispatch(clearBodyScanError());

    if (!frontPhoto || !sidePhoto) {
      setLocalError('Use the AI camera to capture front and side photos (required for pose validation).');
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
    setViewedScan(null);
    setFrontPhoto(null);
    setSidePhoto(null);
    setFrontPreview('');
    setSidePreview('');
    setLocalError(null);
    setCameraType(null);
    setHardValidation(EMPTY_HARD_VALIDATION);
  };

  const onRetakeWithPoseGuidance = () => {
    const validation = buildHardValidation(measurement?.errors);
    setHardValidation(validation);
    setFrontPhoto(null);
    setSidePhoto(null);
    setFrontPreview('');
    setSidePreview('');
    setViewedScan(null);
    dispatch(clearCurrentBodyScan());
    openCamera(validation.front && !validation.side ? 'front' : 'front', validation);
  };

  const displayMeasurement = viewedScan?.measurement || measurement;
  const displayStatus = viewedScan
    ? viewedScan.status || viewedScan.measurement?.status
    : status;
  const displayScan = viewedScan || bodyScan.current;

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
        hardValidation={hardValidation}
        onSaveFront={onSaveFront}
        onSaveSide={onSaveSide}
        onTurnOff={onTurnOffCamera}
        onDisableTableFlow={onDisableTableFlow}
      />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        <PageTitle
          title="Body Scan"
          subtitle="AI camera with real-time pose validation guides your front and side photos, then FitXpress builds your measurements."
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

        {displayStatus === 'successful' && displayMeasurement && (
          <Box sx={{ mb: 3 }}>
            <BodyScanResults
              measurement={displayMeasurement}
              scan={displayScan}
              onNewScan={onNewScan}
              showAvatar
            />
          </Box>
        )}

        {displayStatus === 'failed' && !viewedScan && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Scan failed
            {measurement?.errors?.length
              ? `: ${measurement.errors.map((e) => e.detail || e.description).join('; ')}`
              : '. Check pose and lighting, then try again.'}
            <Button size="small" onClick={onRetakeWithPoseGuidance} sx={{ ml: 1 }}>
              Retake with pose guidance
            </Button>
            <Button size="small" onClick={onNewScan} sx={{ ml: 1 }}>
              Start over
            </Button>
          </Alert>
        )}

        {!viewedScan &&
          (!status || status === 'pending' || status === 'in_progress' || status === 'failed') && (
          <Card sx={{ mb: 3, backgroundColor: '#1a1a1a' }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                <AccessibilityNew sx={{ color: '#877449' }} />
                <Typography variant="h6" sx={{ color: '#877449' }}>
                  New body scan
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wear form-fitting clothes. The AI camera uses real-time pose validation (silhouette +
                voice guidance) — gallery uploads are disabled so every scan gets a guided capture.
                Height is required in centimeters.
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
                      label="Photograph myself (hands-free AI guide + pose validation)"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      On = gyro-assisted self capture. Off = a friend takes photos with the rear camera
                      (still with real-time pose guidance).
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      variant="contained"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      disabled={busy}
                      sx={{ minHeight: 56 }}
                      onClick={() => openCamera('front', hardValidation)}
                    >
                      {frontPreview ? 'Retake front (pose-validated)' : 'AI camera — front'}
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
                      onClick={() => openCamera('side', hardValidation)}
                    >
                      {sidePreview ? 'Retake side (pose-validated)' : 'AI camera — side'}
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
                <Box
                  key={scan.measurementId}
                  onClick={() => {
                    if (scan.status === 'successful' && scan.measurement) {
                      setViewedScan(scan);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  sx={{
                    cursor:
                      scan.status === 'successful' && scan.measurement
                        ? 'pointer'
                        : 'default',
                    '&:hover':
                      scan.status === 'successful' && scan.measurement
                        ? { opacity: 0.85 }
                        : undefined,
                  }}
                >
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
