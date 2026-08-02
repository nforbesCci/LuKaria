'use client';

import { useBookingUrl, DEFAULT_BOOKING_URL } from '../hooks/useBookingUrl';

/**
 * Anchor that uses the System Settings calendar booking URL.
 */
export default function BookingLink({
  children,
  className,
  style,
  href: _ignoredHref,
  ...rest
}) {
  const { bookingUrl } = useBookingUrl();
  return (
    <a
      href={bookingUrl || DEFAULT_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </a>
  );
}
