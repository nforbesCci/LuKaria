import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import { isDateInReminderWindow, todayIsoInClinicTz } from '../../../../lib/booking-reminders';

export const dynamic = 'force-dynamic';

/** Patient: active next-appointment booking reminder for local phone scheduling. */
export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.sub;
    const db = await getDatabase();
    const profile = await db.collection('profiles').findOne({ userId });
    const reminder = profile?.nextBookingReminder || null;
    const today = todayIsoInClinicTz();
    const active = isDateInReminderWindow(reminder, today);

    return NextResponse.json({
      success: true,
      today,
      active,
      reminder: reminder
        ? {
            startDate: reminder.startDate,
            endDate: reminder.endDate,
            active: Boolean(reminder.active),
            setAt: reminder.setAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Mine booking reminder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load reminder' }, { status: 500 });
  }
}
