import { NextResponse } from 'next/server';
import {
  DEFAULT_BOOKING_URL,
  getCalendarConfig,
  toCalendarPublicView,
} from '../../../lib/calendar-config';

export const dynamic = 'force-dynamic';

/** Public booking URL/provider for CTAs across the site and mobile. */
export async function GET() {
  try {
    const config = await getCalendarConfig();
    return NextResponse.json({
      success: true,
      calendar: toCalendarPublicView(config),
    });
  } catch (error) {
    console.error('[Calendar Public] GET error:', error);
    return NextResponse.json(
      {
        success: true,
        calendar: {
          provider: 'calendly',
          bookingUrl: DEFAULT_BOOKING_URL,
          eventTypeUrl: DEFAULT_BOOKING_URL,
          bookingLabel: 'Book an appointment',
          enabled: true,
        },
      },
      { status: 200 },
    );
  }
}
