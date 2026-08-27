'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import ScheduleBooking from '../../components/ScheduleBooking';
import {
  Container,
  Typography,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';

const gold = '#877449';
const goldDark = '#6B5A35';

export default function Schedule() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();

  if (isLoading || !user) {
    return (
      <>
        <Header />
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress sx={{ color: gold }} />
          <Typography sx={{ mt: 2 }}>Loading schedule…</Typography>
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
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: goldDark }}>
            Schedule Appointment
          </Typography>
        </Box>
        <ScheduleBooking
          onSuccess={() => {
            setTimeout(() => router.push('/dashboard'), 700);
          }}
        />
      </Container>
    </>
  );
}
