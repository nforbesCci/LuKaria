import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../../lib/api-auth';
import { getDatabase } from '../../../../../../lib/mongodb';
import {
  buildReminderWindow,
  completeBookingRemindersForUser,
  insertBookingReminderNotification,
  isDateInReminderWindow,
  todayIsoInClinicTz,
} from '../../../../../../lib/booking-reminders';

export const dynamic = 'force-dynamic';

async function requireDoctor(request) {
  const session = await getApiSession(request);
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!hasAdminOrDoctorRole(session.user)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { session };
}

export async function GET(request, { params }) {
  try {
    const auth = await requireDoctor(request);
    if (auth.error) return auth.error;
    const userId = params.userId;
    const db = await getDatabase();
    const profile = await db.collection('profiles').findOne({ userId });
    return NextResponse.json({
      success: true,
      reminder: profile?.nextBookingReminder || null,
    });
  } catch (error) {
    console.error('Get booking reminder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load reminder' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const auth = await requireDoctor(request);
    if (auth.error) return auth.error;
    const userId = params.userId;
    const body = await request.json();
    const startDate = body.startDate || body.date;
    if (!startDate) {
      return NextResponse.json({ error: 'startDate is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const window = buildReminderWindow(startDate);
    const reminder = {
      ...window,
      setBy: auth.session.user.sub,
      setByName: auth.session.user.name || auth.session.user.email || null,
      setAt: new Date().toISOString(),
      lastNotifiedDate: null,
      completedAt: null,
      completedReason: null,
    };

    const db = await getDatabase();
    await db.collection('profiles').updateOne(
      { userId },
      {
        $set: {
          userId,
          nextBookingReminder: reminder,
          updatedAt: new Date(),
          updatedBy: auth.session.user.sub,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    let notifiedToday = false;
    if (isDateInReminderWindow(reminder)) {
      const today = todayIsoInClinicTz();
      const { inserted } = await insertBookingReminderNotification(userId, {
        dayIso: today,
        setBy: auth.session.user.sub,
      });
      notifiedToday = inserted;
      if (inserted) {
        await db.collection('profiles').updateOne(
          { userId },
          { $set: { 'nextBookingReminder.lastNotifiedDate': today } },
        );
        reminder.lastNotifiedDate = today;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Patient will be reminded daily from ${reminder.startDate} through ${reminder.endDate}`,
      reminder,
      notifiedToday,
    });
  } catch (error) {
    console.error('Set booking reminder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to set reminder' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await requireDoctor(request);
    if (auth.error) return auth.error;
    const userId = params.userId;
    await completeBookingRemindersForUser(userId, { reason: 'cleared_by_staff' });
    return NextResponse.json({ success: true, message: 'Booking reminders cleared' });
  } catch (error) {
    console.error('Clear booking reminder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to clear reminder' }, { status: 500 });
  }
}
