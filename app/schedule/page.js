'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import {
  Container,
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

export default function Schedule() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const [types, setTypes] = useState([]);
  const [selectedUri, setSelectedUri] = useState('');
  const [day, setDay] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/appointment/bookable');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load types');
      const list = (data.types || []).filter((t) => t.eventTypeUri);
      setTypes(list);
      if (!selectedUri && list[0]?.eventTypeUri) setSelectedUri(list[0].eventTypeUri);
      setFeedback(null);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [selectedUri]);

  const loadSlots = useCallback(async () => {
    if (!selectedUri || !day) return;
    setLoading(true);
    setSelectedSlot('');
    try {
      const start = `${day}T00:00:00.000Z`;
      const next = new Date(`${day}T12:00:00Z`);
      next.setUTCDate(next.getUTCDate() + 1);
      const end = next.toISOString().slice(0, 10) + 'T00:00:00.000Z';
      const res = await fetch(
        `/api/appointment/availability?eventTypeUri=${encodeURIComponent(selectedUri)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load slots');
      setSlots((data.slots || []).map((s) => s.startTime).filter(Boolean));
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedUri, day]);

  useEffect(() => {
    if (user) loadTypes();
  }, [user, loadTypes]);

  useEffect(() => {
    if (selectedUri) loadSlots();
  }, [selectedUri, day, loadSlots]);

  const book = async () => {
    if (!selectedUri || !selectedSlot) return;
    setBooking(true);
    try {
      const typeName = types.find((t) => t.eventTypeUri === selectedUri)?.name;
      const res = await fetch('/api/appointment/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTypeUri: selectedUri,
          startTime: selectedSlot,
          typeName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setFeedback({ type: 'success', text: 'Appointment booked. Redirecting…' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setBooking(false);
    }
  };

  if (isLoading || !user) {
    return (
      <>
        <Header />
        <Container sx={{ py: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container sx={{ py: 4 }}>
          <Alert severity="error">{error.message}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Schedule appointment
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Book with Calendly using the appointment types your care team allows.
        </Typography>

        {feedback && (
          <Alert severity={feedback.type} sx={{ mb: 2 }}>
            {feedback.text}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <TextField
              select
              label="Appointment type"
              value={selectedUri}
              onChange={(e) => setSelectedUri(e.target.value)}
              fullWidth
              disabled={!types.length}
            >
              {types.map((t) => (
                <MenuItem key={t.id || t.eventTypeUri} value={t.eventTypeUri}>
                  {t.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Available times
              </Typography>
              {loading ? (
                <CircularProgress size={24} />
              ) : slots.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No open slots on this day.
                </Typography>
              ) : (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {slots.map((slot) => (
                    <Chip
                      key={slot}
                      label={new Date(slot).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      color={selectedSlot === slot ? 'primary' : 'default'}
                      onClick={() => setSelectedSlot(slot)}
                    />
                  ))}
                </Stack>
              )}
            </Box>
            <Button
              variant="contained"
              disabled={!selectedUri || !selectedSlot || booking}
              onClick={book}
            >
              {booking ? 'Booking…' : 'Confirm booking'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
