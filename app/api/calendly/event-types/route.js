import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getCalendarConfig, toCalendarAdminView } from '../../../../lib/calendar-config';
import { listEventTypes, resolveCalendlyToken } from '../../../../lib/calendly';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const roles = session.user['https://lukariagroup.com/roles'] || [];
    const isStaff = roles.some(
      (r) => String(r).toLowerCase() === 'admin' || String(r).toLowerCase() === 'doctor',
    );
    if (!isStaff) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const config = await getCalendarConfig();
    const token = await resolveCalendlyToken(config.apiToken);
    const eventTypes = await listEventTypes(token);

    return NextResponse.json({
      success: true,
      eventTypes,
      config: toCalendarAdminView(config),
    });
  } catch (error) {
    console.error('Calendly event-types error:', error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to list Calendly event types', details: error.payload },
      { status },
    );
  }
}
