'use client';

import { Button } from '@mui/material';
import { useBookingUrl, DEFAULT_BOOKING_URL } from '../hooks/useBookingUrl';

/** MUI Button that opens the configured System Settings booking URL. */
export default function BookingButton({ children, ...props }) {
  const { bookingUrl } = useBookingUrl();
  return (
    <Button
      component="a"
      href={bookingUrl || DEFAULT_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </Button>
  );
}
