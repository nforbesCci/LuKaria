'use client';

import { useEffect, useState } from 'react';

export const DEFAULT_BOOKING_URL =
  'https://calendly.com/kadriaf-lukariagroup/weight-loss-consultation';
export const DEFAULT_BOOKING_LABEL = 'Book an appointment';

let cachedCalendar = null;
let inflight = null;

async function fetchCalendarConfig() {
  if (cachedCalendar) return cachedCalendar;
  if (inflight) return inflight;
  inflight = fetch('/api/calendar')
    .then(async (res) => {
      const data = await res.json();
      const calendar = data.calendar || {
        bookingUrl: DEFAULT_BOOKING_URL,
        bookingLabel: DEFAULT_BOOKING_LABEL,
        provider: 'calendly',
      };
      cachedCalendar = calendar;
      return calendar;
    })
    .catch(() => ({
      bookingUrl: DEFAULT_BOOKING_URL,
      bookingLabel: DEFAULT_BOOKING_LABEL,
      provider: 'calendly',
    }))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Clear cache after admin saves calendar settings (same tab). */
export function invalidateBookingUrlCache() {
  cachedCalendar = null;
}

/**
 * Client hook: resolves configured booking URL from System Settings → Calendar.
 */
export function useBookingUrl() {
  const [bookingUrl, setBookingUrl] = useState(
    cachedCalendar?.bookingUrl || DEFAULT_BOOKING_URL,
  );
  const [bookingLabel, setBookingLabel] = useState(
    cachedCalendar?.bookingLabel || DEFAULT_BOOKING_LABEL,
  );
  const [provider, setProvider] = useState(cachedCalendar?.provider || 'calendly');
  const [eventTypeUrl, setEventTypeUrl] = useState(
    cachedCalendar?.eventTypeUrl || cachedCalendar?.bookingUrl || DEFAULT_BOOKING_URL,
  );
  const [loading, setLoading] = useState(!cachedCalendar);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchCalendarConfig().then((calendar) => {
      if (cancelled) return;
      setBookingUrl(calendar.bookingUrl || DEFAULT_BOOKING_URL);
      setBookingLabel(calendar.bookingLabel || DEFAULT_BOOKING_LABEL);
      setProvider(calendar.provider || 'calendly');
      setEventTypeUrl(
        calendar.eventTypeUrl || calendar.bookingUrl || DEFAULT_BOOKING_URL,
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { bookingUrl, bookingLabel, provider, eventTypeUrl, loading };
}
