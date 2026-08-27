import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import {
  getCalendarConfig,
  resolveBookableAppointmentTypes,
} from '../../../../lib/calendar-config';

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

    const resolved = await resolveBookableAppointmentTypes(config);
    const types = resolved
      .filter((t) => String(t.eventTypeUri || '').includes('api.calendly.com/event_types/'))
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
      providerName: 'Dr Kadria Fairclough',
      ...(types.length === 0
        ? {
            message:
              'No Calendly event types with API URIs are configured. Add a Calendly API token and import types in System Settings ΓåÆ Calendar.',
          }
        : {}),
    });
  } catch (error) {
    console.error('Bookable types error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load bookable types' },
      { status: 500 },
    );
  }
}
