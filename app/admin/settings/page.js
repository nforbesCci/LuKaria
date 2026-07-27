'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAdminAccess } from '../../../hooks/useAccessControl';
import Header from '../../../components/Header';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  Done as DoneIcon,
  Email as EmailIcon,
  Google as GoogleIcon,
  Microsoft as MicrosoftIcon,
  Send as SendIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const gold = '#877449';

export default function AdminSettingsPage() {
  useAdminAccess();
  const { isLoading: authLoading } = useUser();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msClientId, setMsClientId] = useState('');
  const [msClientSecret, setMsClientSecret] = useState('');
  const [msTenantId, setMsTenantId] = useState('common');
  const [msRedirectUri, setMsRedirectUri] = useState('');
  const [gClientId, setGClientId] = useState('');
  const [gClientSecret, setGClientSecret] = useState('');
  const [gRedirectUri, setGRedirectUri] = useState('');
  const [savingMSConfig, setSavingMSConfig] = useState(false);
  const [savingGConfig, setSavingGConfig] = useState(false);
  const [testingMS, setTestingMS] = useState(false);
  const [testingGoogle, setTestingGoogle] = useState(false);
  const [msRecipient, setMsRecipient] = useState('');
  const [googleRecipient, setGoogleRecipient] = useState('');
  const [feedback, setFeedback] = useState(null);

  const fetchStatus = async () => {
    try {
      const { data } = await axios.get('/api/admin/settings');
      setStatus(data);
      if (data.microsoft?.config) {
        setMsClientId(data.microsoft.config.clientId || '');
        // Don't put masked placeholder into the form — empty means "keep existing"
        const msSecret = data.microsoft.config.clientSecret || '';
        setMsClientSecret(msSecret.includes('...') ? '' : msSecret);
        setMsTenantId(data.microsoft.config.tenantId || 'common');
        setMsRedirectUri(data.microsoft.config.redirectUri || '');
      }
      if (data.google?.config) {
        setGClientId(data.google.config.clientId || '');
        const gSecret = data.google.config.clientSecret || '';
        setGClientSecret(gSecret.includes('...') ? '' : gSecret);
        setGRedirectUri(data.google.config.redirectUri || '');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load settings',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'microsoft_connected') {
      setFeedback({ type: 'success', message: 'Microsoft account connected successfully!' });
    } else if (params.get('success') === 'google_connected') {
      setFeedback({ type: 'success', message: 'Google account connected successfully!' });
    } else if (params.get('error')) {
      const details = params.get('details');
      setFeedback({
        type: 'error',
        message: details
          ? `Integration failed: ${params.get('error')} — ${details}`
          : `Integration failed: ${params.get('error')}`,
      });
    }
  }, []);

  const handleSaveMSConfig = async () => {
    setSavingMSConfig(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/settings/config', {
        type: 'microsoft',
        config: {
          clientId: msClientId,
          clientSecret: msClientSecret,
          tenantId: msTenantId,
          redirectUri:
            msRedirectUri ||
            `${window.location.origin}/api/admin/microsoft/callback`,
        },
      });
      setFeedback({ type: 'success', message: 'Microsoft configuration saved!' });
      await fetchStatus();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save config',
      });
    } finally {
      setSavingMSConfig(false);
    }
  };

  const handleSaveGConfig = async () => {
    setSavingGConfig(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/settings/config', {
        type: 'google',
        config: {
          clientId: gClientId,
          clientSecret: gClientSecret,
          redirectUri:
            gRedirectUri || `${window.location.origin}/api/admin/google/callback`,
        },
      });
      setFeedback({ type: 'success', message: 'Google configuration saved!' });
      await fetchStatus();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save config',
      });
    } finally {
      setSavingGConfig(false);
    }
  };

  const handleSendTestMS = async () => {
    if (!msRecipient) return;
    setTestingMS(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/microsoft/test', { to: msRecipient });
      setFeedback({
        type: 'success',
        message: `Test email sent to ${msRecipient} via Microsoft`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to send test email',
      });
    } finally {
      setTestingMS(false);
    }
  };

  const handleSendTestGoogle = async () => {
    if (!googleRecipient) return;
    setTestingGoogle(true);
    setFeedback(null);
    try {
      await axios.post('/api/admin/google/test', { to: googleRecipient });
      setFeedback({
        type: 'success',
        message: `Test email sent to ${googleRecipient} via Google`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to send test email',
      });
    } finally {
      setTestingGoogle(false);
    }
  };

  const isMicrosoftDirty =
    msClientId !== (status?.microsoft?.config?.clientId || '') ||
    msClientSecret !== (status?.microsoft?.config?.clientSecret || '') ||
    msTenantId !== (status?.microsoft?.config?.tenantId || '') ||
    msRedirectUri !== (status?.microsoft?.config?.redirectUri || '');

  const isGoogleDirty =
    gClientId !== (status?.google?.config?.clientId || '') ||
    gClientSecret !== (status?.google?.config?.clientSecret || '') ||
    gRedirectUri !== (status?.google?.config?.redirectUri || '');

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
          <CircularProgress sx={{ color: gold }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          System Settings
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Configure email integrations for clinic outbound mail (Microsoft 365 / Gmail).
        </Typography>

        {feedback && (
          <Alert
            severity={feedback.type}
            sx={{ mb: 3 }}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }} elevation={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <MicrosoftIcon sx={{ color: gold }} />
                  <Typography variant="h6">Microsoft / M365</Typography>
                </Box>
                <Chip
                  size="small"
                  icon={status?.microsoft?.connected ? <DoneIcon /> : <WarningIcon />}
                  label={status?.microsoft?.connected ? 'Connected' : 'Not Linked'}
                  color={status?.microsoft?.connected ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>

              <Typography variant="subtitle2" sx={{ color: gold, mb: 1.5 }}>
                App Registration Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                  label="Directory (tenant) ID"
                  size="small"
                  value={msTenantId}
                  onChange={(e) => setMsTenantId(e.target.value)}
                  helperText="Azure → App registration → Overview → Directory (tenant) ID"
                />
                <TextField
                  label="Application (client) ID"
                  size="small"
                  value={msClientId}
                  onChange={(e) => setMsClientId(e.target.value)}
                  helperText="Azure → App registration → Overview → Application (client) ID"
                />
                <TextField
                  label="Client Secret"
                  type="password"
                  size="small"
                  value={msClientSecret}
                  onChange={(e) => setMsClientSecret(e.target.value)}
                  placeholder="Leave unchanged, or paste Azure secret Value"
                  helperText="Use Azure Secret Value (not Secret ID). Leave as-is if already configured."
                />
                <TextField
                  label="Redirect URI (reply URL)"
                  size="small"
                  value={
                    msRedirectUri ||
                    (typeof window !== 'undefined'
                      ? `${window.location.origin}/api/admin/microsoft/callback`
                      : '')
                  }
                  onChange={(e) => setMsRedirectUri(e.target.value)}
                  helperText="Must match Azure → Authentication → Web redirect URIs (not SPA)"
                />
                <Button
                  variant="outlined"
                  onClick={handleSaveMSConfig}
                  disabled={savingMSConfig || !msClientId || !msClientSecret}
                  sx={{ borderColor: gold, color: gold }}
                >
                  {savingMSConfig ? <CircularProgress size={18} /> : 'Save Microsoft Config'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {!status?.microsoft?.connected || isMicrosoftDirty ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {status?.microsoft?.connected
                      ? 'Configuration modified. Save and re-authorize to apply changes.'
                      : 'Save configuration, then authorize the system mailbox.'}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<MicrosoftIcon />}
                    onClick={() => {
                      window.location.href = '/api/admin/microsoft/auth';
                    }}
                    disabled={!status?.microsoft?.config}
                    sx={{ bgcolor: gold, '&:hover': { bgcolor: '#5C4E31' } }}
                  >
                    {status?.microsoft?.connected ? 'Update & Authorize' : 'Authorize Microsoft'}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary">
                    Active Master Account
                  </Typography>
                  <Typography sx={{ mb: 2 }}>{status.microsoft.email}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Test recipient"
                      value={msRecipient}
                      onChange={(e) => setMsRecipient(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSendTestMS}
                      disabled={testingMS || !msRecipient}
                      sx={{ borderColor: gold, color: gold, minWidth: 48 }}
                    >
                      {testingMS ? <CircularProgress size={18} /> : <SendIcon fontSize="small" />}
                    </Button>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => {
                      window.location.href = '/api/admin/microsoft/auth';
                    }}
                  >
                    Re-authorize or Change Account
                  </Button>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }} elevation={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <GoogleIcon sx={{ color: gold }} />
                  <Typography variant="h6">Google / Gmail</Typography>
                </Box>
                <Chip
                  size="small"
                  icon={status?.google?.connected ? <DoneIcon /> : <WarningIcon />}
                  label={status?.google?.connected ? 'Connected' : 'Not Linked'}
                  color={status?.google?.connected ? 'success' : 'warning'}
                  variant="outlined"
                />
              </Box>

              <Typography variant="subtitle2" sx={{ color: gold, mb: 1.5 }}>
                Cloud Console Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                  label="Client ID"
                  size="small"
                  value={gClientId}
                  onChange={(e) => setGClientId(e.target.value)}
                />
                <TextField
                  label="Client Secret"
                  type="password"
                  size="small"
                  value={gClientSecret}
                  onChange={(e) => setGClientSecret(e.target.value)}
                />
                <Button
                  variant="outlined"
                  onClick={handleSaveGConfig}
                  disabled={savingGConfig || !gClientId || !gClientSecret}
                  sx={{ borderColor: gold, color: gold }}
                >
                  {savingGConfig ? <CircularProgress size={18} /> : 'Save Google Config'}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {!status?.google?.connected || isGoogleDirty ? (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {status?.google?.connected
                      ? 'Configuration modified. Save and re-authorize to apply changes.'
                      : 'Save configuration, then authorize the system mailbox.'}
                  </Typography>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<GoogleIcon />}
                    onClick={() => {
                      window.location.href = '/api/admin/google/auth';
                    }}
                    disabled={!status?.google?.config}
                    sx={{ bgcolor: gold, '&:hover': { bgcolor: '#5C4E31' } }}
                  >
                    {status?.google?.connected ? 'Update & Authorize' : 'Authorize Google'}
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="overline" color="text.secondary">
                    Active Master Account
                  </Typography>
                  <Typography sx={{ mb: 2 }}>{status.google.email}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Test recipient"
                      value={googleRecipient}
                      onChange={(e) => setGoogleRecipient(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={handleSendTestGoogle}
                      disabled={testingGoogle || !googleRecipient}
                      sx={{ borderColor: gold, color: gold, minWidth: 48 }}
                    >
                      {testingGoogle ? (
                        <CircularProgress size={18} />
                      ) : (
                        <SendIcon fontSize="small" />
                      )}
                    </Button>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => {
                      window.location.href = '/api/admin/google/auth';
                    }}
                  >
                    Re-authorize or Change Account
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 4, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: 1 }}
        >
          <EmailIcon fontSize="small" />
          Admin-only. OAuth redirect URIs must match your Azure / Google app registration.
        </Typography>
      </Container>
    </>
  );
}
