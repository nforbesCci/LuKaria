'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Alert,
  CircularProgress,
  Button,
  Stack,
  MenuItem,
  TextField,
  Chip,
} from '@mui/material';
import {
  AccessTime,
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

const gold = '#877449';
const goldDark = '#6B5A35';

function startOfLocalDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(d) {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimeLabel(iso, timeZone) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timeZone || undefined,
  });
}

/**
 * Native Calendly-backed schedule picker (same UX as /schedule).
 * @param {object} props
 * @param {string} [props.forUserId] - When set (admin/doctor), books for that patient.
 * @param {() => void} [props.onSuccess]
 * @param {boolean} [props.showChangeNote]
 * @param {string} [props.subtitle]
 */
export default function ScheduleBooking({
  forUserId = null,
  onSuccess,
  showChangeNote = true,
  subtitle = null,
}) {
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Jamaica';
    } catch {
      return 'America/Jamaica';
    }
  }, []);

  const today = useMemo(() => startOfLocalDay(new Date()), []);
  const [weekStart, setWeekStart] = useState(() => startOfLocalDay(new Date()));
  const [selectedDay, setSelectedDay] = useState(() => startOfLocalDay(new Date()));
  const [types, setTypes] = useState([]);
  const [selectedUri, setSelectedUri] = useState('');
  const [providerName, setProviderName] = useState('Dr Kadria Fairclough');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [typesLoading, setTypesLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const daySlots = useMemo(
    () =>
      slots
        .filter((s) => sameLocalDay(new Date(s.startTime), selectedDay))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [slots, selectedDay],
  );

  const selectedType = useMemo(
    () => types.find((t) => t.eventTypeUri === selectedUri) || null,
    [types, selectedUri],
  );

  const loadTypes = useCallback(async () => {
    setTypesLoading(true);
    try {
      const res = await fetch('/api/appointment/bookable', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load appointment types');
      const list = (data.types || []).filter((t) => t.eventTypeUri);
      setTypes(list);
      setProviderName(data.providerName || 'Dr Kadria Fairclough');
      if (list.length === 1) {
        setSelectedUri(list[0].eventTypeUri);
      } else if (list.length > 0) {
        setSelectedUri((prev) =>
          list.some((t) => t.eventTypeUri === prev) ? prev : '',
        );
      } else {
        setSelectedUri('');
      }
      setFeedback(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setTypes([]);
    } finally {
      setTypesLoading(false);
    }
  }, []);

  const loadSlots = useCallback(async () => {
    if (!selectedUri) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const start = weekStart.toISOString();
      const end = addDays(weekStart, 7).toISOString();
      const res = await fetch(
        `/api/appointment/availability?eventTypeUri=${encodeURIComponent(selectedUri)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
        { cache: 'no-store' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load availability');
      setSlots(Array.isArray(data.slots) ? data.slots : []);
      setFeedback(null);
    } catch (err) {
      setSlots([]);
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedUri, weekStart]);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  useEffect(() => {
    if (selectedUri) loadSlots();
  }, [selectedUri, loadSlots]);

  const book = async () => {
    if (!selectedUri || !selectedSlot?.startTime) return;
    setBooking(true);
    try {
      const payload = {
        eventTypeUri: selectedUri,
        startTime: selectedSlot.startTime,
        typeName: selectedType?.name,
        timezone,
      };
      if (forUserId) payload.forUserId = forUserId;

      const res = await fetch('/api/appointment/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setBookSuccess(true);
      setFeedback({
        type: 'success',
        text: forUserId
          ? 'Appointment booked for this patient.'
          : 'Appointment booked.',
      });
      if (typeof onSuccess === 'function') {
        setTimeout(() => onSuccess(data), 800);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setBooking(false);
    }
  };

  if (bookSuccess && !onSuccess) {
    return (
      <Alert severity="success">Appointment booked.</Alert>
    );
  }

  const canGoPrev = weekStart > today;
  const defaultSubtitle = forUserId
    ? `Choose an appointment type and time for this patient with ${providerName}.`
    : `Choose an appointment type and available time for your visit with ${providerName}.`;

  return (
    <Box>
      {(subtitle || defaultSubtitle) && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle || defaultSubtitle}
        </Typography>
      )}

      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid rgba(135,116,73,0.35)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarMonth sx={{ fontSize: 28, mr: 1.5, color: gold }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: goldDark }}>
            Available times
          </Typography>
        </Box>
      </Paper>

      {feedback && (
        <Alert
          severity={feedback.type}
          sx={{ mb: 2 }}
          onClose={() => setFeedback(null)}
        >
          {feedback.text}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid rgba(135,116,73,0.35)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: goldDark, mb: 1.5 }}>
          Appointment type
        </Typography>
        {typesLoading ? (
          <CircularProgress size={24} sx={{ color: gold }} />
        ) : types.length > 0 ? (
          <TextField
            select
            fullWidth
            size="small"
            label="Type"
            value={selectedUri}
            onChange={(e) => {
              setSelectedUri(e.target.value);
              setSelectedSlot(null);
              setSlots([]);
            }}
          >
            {types.map((t) => (
              <MenuItem key={t.id || t.eventTypeUri} value={t.eventTypeUri}>
                {t.name}
                {t.durationMinutes ? ` (${t.durationMinutes} min)` : ''}
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <Alert severity="warning">
            No appointment types are configured yet. An admin can add them under System Settings
            → Calendar (Import from Calendly).
          </Alert>
        )}
        {selectedUri ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            Provider: {providerName}
          </Typography>
        ) : null}
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, border: '1px solid rgba(135,116,73,0.35)' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
            gap: 1,
            flexWrap: 'wrap',
          }}
        >
          <Button
            startIcon={<ChevronLeft />}
            disabled={!canGoPrev || slotsLoading || !selectedUri}
            onClick={() => {
              const next = addDays(weekStart, -7);
              const clamped = next < today ? today : next;
              setWeekStart(clamped);
              setSelectedDay(clamped);
            }}
            sx={{ textTransform: 'none', color: goldDark }}
          >
            Previous
          </Button>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: goldDark }}>
            {formatDayLabel(weekStart)} – {formatDayLabel(addDays(weekStart, 6))}
          </Typography>
          <Button
            endIcon={<ChevronRight />}
            disabled={slotsLoading || !selectedUri}
            onClick={() => {
              const next = addDays(weekStart, 7);
              setWeekStart(next);
              setSelectedDay(next);
            }}
            sx={{ textTransform: 'none', color: goldDark }}
          >
            Next
          </Button>
        </Box>

        {!selectedUri ? (
          <Alert severity="info">Select an appointment type to see available times.</Alert>
        ) : (
          <>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
              {weekDays.map((day) => {
                const count = slots.filter((s) =>
                  sameLocalDay(new Date(s.startTime), day),
                ).length;
                const selected = sameLocalDay(day, selectedDay);
                const past = day < today;
                return (
                  <Chip
                    key={day.toISOString()}
                    label={`${formatDayLabel(day)}${count ? ` (${count})` : ''}`}
                    onClick={() => !past && setSelectedDay(day)}
                    disabled={past}
                    clickable={!past}
                    sx={{
                      fontWeight: selected ? 700 : 500,
                      bgcolor: selected ? gold : '#FAF8F4',
                      color: selected ? '#fff' : goldDark,
                      border: selected ? 'none' : '1px solid rgba(135,116,73,0.35)',
                      '&:hover': {
                        bgcolor: selected ? goldDark : 'rgba(135,116,73,0.12)',
                      },
                    }}
                  />
                );
              })}
            </Stack>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <AccessTime sx={{ color: gold }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: goldDark }}>
                Times for {formatDayLabel(selectedDay)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({timezone})
              </Typography>
            </Box>

            {slotsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress sx={{ color: gold }} size={32} />
              </Box>
            ) : daySlots.length === 0 ? (
              <Alert severity="info">No open times on this day. Try another day.</Alert>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2, 1fr)',
                    sm: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                  },
                  gap: 1.25,
                }}
              >
                {daySlots.map((slot) => {
                  const selected = selectedSlot?.startTime === slot.startTime;
                  return (
                    <Button
                      key={slot.startTime}
                      variant={selected ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSlot(slot)}
                      sx={{
                        textTransform: 'none',
                        borderColor: gold,
                        color: selected ? '#fff' : goldDark,
                        bgcolor: selected ? gold : 'transparent',
                        '&:hover': {
                          bgcolor: selected ? goldDark : 'rgba(135,116,73,0.1)',
                          borderColor: gold,
                        },
                      }}
                    >
                      {formatTimeLabel(slot.startTime, timezone)}
                    </Button>
                  );
                })}
              </Box>
            )}

            <Box
              sx={{
                mt: 3,
                display: 'flex',
                gap: 1.5,
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <Button
                variant="contained"
                disabled={!selectedSlot || booking || slotsLoading}
                onClick={book}
                sx={{
                  textTransform: 'none',
                  bgcolor: gold,
                  color: '#000',
                  '&:hover': { bgcolor: goldDark, color: '#fff' },
                  minWidth: 160,
                }}
              >
                {booking ? 'Booking…' : 'Confirm appointment'}
              </Button>
              <Button
                variant="text"
                disabled={slotsLoading}
                onClick={loadSlots}
                sx={{ textTransform: 'none', color: goldDark }}
              >
                Refresh times
              </Button>
              {selectedSlot && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {formatDayLabel(new Date(selectedSlot.startTime))}{' '}
                  {formatTimeLabel(selectedSlot.startTime, timezone)}
                  {selectedType?.name ? ` · ${selectedType.name}` : ''}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Paper>

      {showChangeNote && !forUserId && (
        <Paper elevation={0} sx={{ p: 2.5, mt: 2, border: '1px solid rgba(135,116,73,0.35)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: goldDark, mb: 1 }}>
            Need to change an appointment?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            To reschedule or cancel, use the link in your Calendly appointment confirmation email.
            That email also has options to add the visit to your calendar.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
