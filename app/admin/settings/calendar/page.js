'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAdminAccess } from '../../../../hooks/useAccessControl';
import Header from '../../../../components/Header';
import { invalidateBookingUrlCache } from '../../../../hooks/useBookingUrl';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Paper,
} from '@mui/material';
import { Add, ArrowBack, CloudDownload, ContentCopy, Delete } from '@mui/icons-material';

const gold = '#877449';
const goldDark = '#6B5A35';

function newAppointmentType(seed = {}) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `type-${Date.now()}`;
  return {
    id,
    name: seed.name || '',
    durationMinutes: seed.durationMinutes ?? 30,
    eventTypeUrl: seed.eventTypeUrl || '',
    eventTypeUri: seed.eventTypeUri || '',
    enabled: seed.enabled !== false,
  };
}

export default function CalendarSettingsPage() {
  useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState('calendly');
  const [bookingUrl, setBookingUrl] = useState('');
  const [eventTypeUrl, setEventTypeUrl] = useState('');
  const [eventTypeUri, setEventTypeUri] = useState('');
  const [bookingLabel, setBookingLabel] = useState('Book an appointment');
  const [enabled, setEnabled] = useState(true);
  const [apiToken, setApiToken] = useState('');
  const [hasApiToken, setHasApiToken] = useState(false);
  const [webhookSigningKey, setWebhookSigningKey] = useState('');
  const [hasWebhookSigningKey, setHasWebhookSigningKey] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [importing, setImporting] = useState(false);
  const [canListEventTypes, setCanListEventTypes] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/settings/calendar');
      setProviders(data.providers || []);
      setProvider(data.config?.provider || 'calendly');
      setBookingUrl(data.config?.bookingUrl || '');
      setEventTypeUrl(data.config?.eventTypeUrl || data.config?.bookingUrl || '');
      setEventTypeUri(data.config?.eventTypeUri || '');
      setBookingLabel(data.config?.bookingLabel || 'Book an appointment');
      setEnabled(data.config?.enabled !== false);
      setApiToken('');
      setHasApiToken(Boolean(data.config?.hasApiToken));
      setCanListEventTypes(Boolean(data.config?.canListEventTypes || data.config?.hasApiToken || data.config?.hasEnvToken));
      setWebhookSigningKey('');
      setHasWebhookSigningKey(Boolean(data.config?.hasWebhookSigningKey));
      setWebhookUrl(data.config?.webhookUrl || '');
      const types = Array.isArray(data.config?.appointmentTypes)
        ? data.config.appointmentTypes
        : [];
      setAppointmentTypes(
        types.length
          ? types
          : [
              newAppointmentType({
                name: 'Weight loss consultation',
                durationMinutes: 30,
                eventTypeUrl: data.config?.eventTypeUrl || data.config?.bookingUrl || '',
                eventTypeUri: data.config?.eventTypeUri || '',
              }),
            ],
      );
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to load calendar settings',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedProvider = providers.find((p) => p.id === provider);

  const updateType = (id, patch) => {
    setAppointmentTypes((list) =>
      list.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const removeType = (id) => {
    setAppointmentTypes((list) => list.filter((t) => t.id !== id));
  };


  const importFromCalendly = async () => {
    setImporting(true);
    setFeedback(null);
    try {
      const { data } = await axios.get('/api/admin/settings/calendar/event-types');
      const fromCalendly = Array.isArray(data.eventTypes) ? data.eventTypes : [];
      const active = fromCalendly.filter((et) => et.active !== false);
      if (!active.length) {
        setFeedback({
          type: 'warning',
          message:
            'Calendly returned no active event types. Check the token scopes (users:read) and organization.',
        });
        return;
      }

      setAppointmentTypes((existing) => {
        const byUri = new Map(
          existing.filter((t) => t.eventTypeUri).map((t) => [t.eventTypeUri, t]),
        );
        const byUrl = new Map(
          existing
            .filter((t) => t.eventTypeUrl)
            .map((t) => [String(t.eventTypeUrl).toLowerCase().replace(/\/+$/, ''), t]),
        );

        const merged = existing.map((t) => ({ ...t }));

        for (const et of active) {
          const urlKey = String(et.schedulingUrl || '')
            .toLowerCase()
            .replace(/\/+$/, '');
          const match =
            (et.uri && byUri.get(et.uri)) || (urlKey ? byUrl.get(urlKey) : null);

          if (match) {
            const idx = merged.findIndex((t) => t.id === match.id);
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                name: et.name || merged[idx].name,
                durationMinutes: et.duration ?? merged[idx].durationMinutes,
                eventTypeUrl: et.schedulingUrl || merged[idx].eventTypeUrl,
                eventTypeUri: et.uri || merged[idx].eventTypeUri,
                enabled: true,
              };
            }
            continue;
          }

          merged.push(
            newAppointmentType({
              name: et.name,
              durationMinutes: et.duration ?? 30,
              eventTypeUrl: et.schedulingUrl || '',
              eventTypeUri: et.uri || '',
              enabled: true,
            }),
          );
        }

        return merged.length ? merged : existing;
      });

      setFeedback({
        type: 'success',
        message: `Loaded ${active.length} Calendly event type(s) for Dr Fairclough. Review which are bookable, then Save.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.error ||
          err.message ||
          'Failed to import from Calendly',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await axios.put('/api/admin/settings/calendar', {
        provider,
        bookingUrl,
        eventTypeUrl: eventTypeUrl || bookingUrl,
        eventTypeUri,
        bookingLabel,
        enabled,
        apiToken,
        webhookSigningKey,
        appointmentTypes,
      });
      invalidateBookingUrlCache();
      setFeedback({ type: 'success', message: 'Calendar settings saved.' });
      await load();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || 'Failed to save',
      });
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = async () => {
    if (!webhookUrl) return;
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setFeedback({ type: 'success', message: 'Webhook URL copied.' });
    } catch {
      setFeedback({ type: 'error', message: 'Could not copy URL' });
    }
  };

  if (loading) {
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          component={Link}
          href="/admin/settings"
          startIcon={<ArrowBack />}
          sx={{ mb: 2, textTransform: 'none', color: goldDark }}
        >
          System Settings
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: goldDark }}>
          Calendar
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Configure Dr Kadria Fairclough's Calendly for marketing CTAs and in-app patient booking. Enable appointment types below so patients can schedule on Schedule.
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

        <Paper
          elevation={0}
          sx={{ p: 3, mb: 3, border: '1px solid rgba(135, 116, 73, 0.35)' }}
        >
          <Stack spacing={2.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Use this calendar booking link site-wide"
            />

            <FormControl fullWidth>
              <InputLabel id="calendar-provider-label">Provider</InputLabel>
              <Select
                labelId="calendar-provider-label"
                label="Provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                {(providers.length
                  ? providers
                  : [
                      { id: 'calendly', label: 'Calendly' },
                      { id: 'calcom', label: 'Cal.com' },
                      { id: 'outlook', label: 'Outlook / Microsoft Bookings' },
                      { id: 'google', label: 'Google Calendar' },
                    ]
                ).map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Booking URL"
              value={bookingUrl}
              onChange={(e) => setBookingUrl(e.target.value)}
              fullWidth
              required
              helperText={
                selectedProvider?.hint ||
                'Full https:// URL used for public “Book an appointment” CTAs.'
              }
            />

            <TextField
              label="Default event type URL"
              value={eventTypeUrl}
              onChange={(e) => setEventTypeUrl(e.target.value)}
              fullWidth
              helperText="Fallback when no appointment types are configured. Defaults to Booking URL if blank."
            />

            {provider === 'calendly' && (
              <TextField
                label="Default Event Type API URI"
                value={eventTypeUri}
                onChange={(e) => setEventTypeUri(e.target.value)}
                fullWidth
                placeholder="https://api.calendly.com/event_types/…"
                helperText="Optional. Stored for future Calendly API scheduling."
              />
            )}

            <TextField
              label="Button label"
              value={bookingLabel}
              onChange={(e) => setBookingLabel(e.target.value)}
              fullWidth
              helperText="Shown on booking CTAs when available."
            />

            {(provider === 'calendly' || provider === 'calcom') && (
              <TextField
                label={
                  provider === 'calendly'
                    ? 'Calendly personal access token'
                    : 'Cal.com API key'
                }
                type="password"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                fullWidth
                placeholder={
                  hasApiToken
                    ? 'Leave blank to keep existing token'
                    : 'Optional — for future API scheduling'
                }
                helperText="Stored server-side only. Not required for public booking links."
              />
            )}

            {provider === 'calendly' && (
              <>
                <TextField
                  label="Webhook signing key"
                  type="password"
                  value={webhookSigningKey}
                  onChange={(e) => setWebhookSigningKey(e.target.value)}
                  fullWidth
                  placeholder={
                    hasWebhookSigningKey
                      ? 'Leave blank to keep existing key'
                      : 'From Calendly → Integrations → Webhooks'
                  }
                  helperText="Optional. For future invitee webhook verification."
                />
                <TextField
                  label="Webhook URL"
                  value={webhookUrl}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={copyWebhookUrl}
                        sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
                      >
                        Copy
                      </Button>
                    ),
                  }}
                  helperText="Register in Calendly when webhook sync is enabled later."
                />
              </>
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{ p: 3, border: '1px solid rgba(135, 116, 73, 0.35)' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: goldDark }}>
                Appointment types
              </Typography>
              <Typography variant="body2" color="text.secondary">
                These are the types patients can book in Lukaria for Dr Fairclough. Use Import from Calendly to pull event types, disable any you do not want bookable, then Save.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {provider === 'calendly' && (
                <Button
                  startIcon={
                    importing ? <CircularProgress size={16} /> : <CloudDownload />
                  }
                  onClick={importFromCalendly}
                  disabled={importing || !canListEventTypes}
                  sx={{ textTransform: 'none', color: goldDark }}
                >
                  Import from Calendly
                </Button>
              )}
              <Button
                startIcon={<Add />}
                onClick={() =>
                  setAppointmentTypes((list) => [
                    ...list,
                    newAppointmentType({
                      eventTypeUrl: eventTypeUrl || bookingUrl,
                    }),
                  ])
                }
                sx={{ textTransform: 'none', color: goldDark }}
              >
                Add type
              </Button>
            </Box>
          </Box>

          <Stack spacing={2} divider={<Divider flexItem />}>
            {appointmentTypes.map((type, index) => (
              <Box key={type.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: goldDark, fontWeight: 600 }}>
                    Type {index + 1}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={type.enabled !== false}
                          onChange={(e) =>
                            updateType(type.id, { enabled: e.target.checked })
                          }
                        />
                      }
                      label="Enabled"
                    />
                    <IconButton
                      size="small"
                      aria-label="Remove appointment type"
                      onClick={() => removeType(type.id)}
                      disabled={appointmentTypes.length <= 1}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Stack spacing={2}>
                  <TextField
                    label="Name"
                    value={type.name}
                    onChange={(e) => updateType(type.id, { name: e.target.value })}
                    fullWidth
                    required
                    placeholder="e.g. Weight loss consultation"
                  />
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={type.durationMinutes ?? ''}
                    onChange={(e) =>
                      updateType(type.id, {
                        durationMinutes: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    fullWidth
                    inputProps={{ min: 5, step: 5 }}
                  />
                  <TextField
                    label="Event type URL"
                    value={type.eventTypeUrl}
                    onChange={(e) => updateType(type.id, { eventTypeUrl: e.target.value })}
                    fullWidth
                    placeholder="https://calendly.com/you/consultation"
                  />
                  {provider === 'calendly' && (
                    <TextField
                      label="Event Type API URI"
                      value={type.eventTypeUri}
                      onChange={(e) => updateType(type.id, { eventTypeUri: e.target.value })}
                      fullWidth
                      placeholder="https://api.calendly.com/event_types/…"
                    />
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || !bookingUrl.trim()}
              sx={{
                textTransform: 'none',
                bgcolor: gold,
                color: '#000',
                '&:hover': { bgcolor: goldDark, color: '#fff' },
              }}
            >
              {saving ? <CircularProgress size={18} /> : 'Save calendar settings'}
            </Button>
            {bookingUrl ? (
              <Button
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 1, textTransform: 'none', color: goldDark }}
              >
                Open booking link
              </Button>
            ) : null}
          </Box>
        </Paper>
      </Container>
    </>
  );
}
