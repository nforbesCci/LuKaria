import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getCalendarConfig } from '../../../../lib/calendar-config';

export const dynamic = 'force-dynamic';

/** Patient-facing list of doctor-enabled Calendly appointment types. */
export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getCalendarConfig();
    if (!config.enabled) {
      return NextResponse.json({
        success: true,
        enabled: false,
        types: [],
        message: 'Online booking is currently disabled',
      });
    }

    const types = (config.appointmentTypes || [])
      .filter((t) => t.enabled !== false && (t.eventTypeUri || t.eventTypeUrl))
      .map((t) => ({
        id: t.id,
        name: t.name,
        durationMinutes: t.durationMinutes,
        eventTypeUri: t.eventTypeUri || null,
        eventTypeUrl: t.eventTypeUrl || null,
      }));

    return NextResponse.json({
      success: true,
      enabled: true,
      types,
      bookingLabel: config.bookingLabel,
    });
  } catch (error) {
    console.error('Bookable types error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load bookable types' },
      { status: 500 },
    );
  }
}
