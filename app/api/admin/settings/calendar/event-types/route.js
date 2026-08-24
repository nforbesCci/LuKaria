import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../../lib/api-auth';
import { getCalendarConfig } from '../../../../../../lib/calendar-config';
import { listEventTypes, resolveCalendlyToken } from '../../../../../../lib/calendly';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/settings/calendar/event-types
 * Lists Calendly event types for Import into appointment types (Dr Fairclough / org token).
 */
export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = await getCalendarConfig();
    let token;
    try {
      token = await resolveCalendlyToken(config.apiToken);
    } catch {
      return NextResponse.json(
        {
          error:
            'Add a Calendly personal access token in Calendar settings (or set CALENDLY_TOKEN / CALENDLY_PERSONAL_ACCESS_TOKEN), then import event types.',
        },
        { status: 503 },
      );
    }

    const eventTypes = await listEventTypes(token);
    return NextResponse.json({
      success: true,
      eventTypes,
      activeCount: eventTypes.filter((t) => t.active !== false).length,
    });
  } catch (error) {
    console.error('[Calendar event-types] GET error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to list Calendly event types',
        details: error.payload || undefined,
      },
      { status: error.status && error.status < 500 ? error.status : 500 },
    );
  }
}
