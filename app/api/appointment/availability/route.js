import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import {
  getCalendarConfig,
  resolveBookableAppointmentTypes,
} from '../../../../lib/calendar-config';
import { listAvailableTimes, resolveCalendlyToken } from '../../../../lib/calendly';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventTypeUri = searchParams.get('eventTypeUri');
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    if (!eventTypeUri || !start || !end) {
      return NextResponse.json(
        { error: 'eventTypeUri, start, and end are required' },
        { status: 400 },
      );
    }

    const config = await getCalendarConfig();
    const bookable = await resolveBookableAppointmentTypes(config);
    const allowed = bookable.some(
      (t) => t.enabled !== false && t.eventTypeUri === eventTypeUri,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'This appointment type is not available for booking' },
        { status: 403 },
      );
    }

    const token = await resolveCalendlyToken(config.apiToken);
    const slots = await listAvailableTimes(token, {
      eventTypeUri,
      startTime: start,
      endTime: end,
    });

    return NextResponse.json({ success: true, slots });
  } catch (error) {
    console.error('Availability error:', error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to load availability', details: error.payload },
      { status },
    );
  }
}
