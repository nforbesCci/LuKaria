import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';
import {
  getCalendarConfig,
  saveCalendarConfig,
  toCalendarAdminView,
  CALENDAR_PROVIDERS,
} from '../../../../../lib/calendar-config';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const config = await getCalendarConfig();
    return NextResponse.json({
      success: true,
      config: toCalendarAdminView(config),
      providers: CALENDAR_PROVIDERS,
    });
  } catch (error) {
    console.error('[Calendar Settings] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load calendar settings', details: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user || !hasAdminOrDoctorRole(session.user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const config = await saveCalendarConfig(body || {});
    return NextResponse.json({
      success: true,
      config: toCalendarAdminView(config),
    });
  } catch (error) {
    console.error('[Calendar Settings] PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save calendar settings' },
      { status: 400 },
    );
  }
}
