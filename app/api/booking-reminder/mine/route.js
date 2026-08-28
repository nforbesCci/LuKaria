import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';
import {
  completeBookingRemindersForUser,
  isDateInReminderWindow,
  todayIsoInClinicTz,
} from '../../../../lib/booking-reminders';

export const dynamic = 'force-dynamic';

function hasUpcomingScheduledAppointment(appointment) {
  if (!appointment?.isScheduled) return false;
  const status = String(appointment.status || '').toLowerCase();
  if (status && status !== 'scheduled') return false;
  const startMs = new Date(appointment.startTime || appointment.date || 0).getTime();
  if (Number.isNaN(startMs)) return Boolean(appointment.isScheduled);
  return startMs > Date.now() - 24 * 60 * 60 * 1000;
}

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
    const appointment = await db.collection('appointments').findOne({ userId });
    const reminder = profile?.nextBookingReminder || null;
    const today = todayIsoInClinicTz();

    let active = isDateInReminderWindow(reminder, today);
    let reminderCompletion = null;

    if (active && hasUpcomingScheduledAppointment(appointment)) {
      try {
        reminderCompletion = await completeBookingRemindersForUser(userId, {
          reason: 'appointment_booked',
        });
      } catch (err) {
        console.error('Auto-complete booking reminders for scheduled patient:', err);
      }
      active = false;
    }

    return NextResponse.json({
      success: true,
      today,
      active,
      reminder: reminder
        ? {
            startDate: reminder.startDate,
            endDate: reminder.endDate,
            active: active && Boolean(reminder.active),
            setAt: reminder.setAt,
            completedAt: reminder.completedAt || null,
            completedReason: reminder.completedReason || null,
          }
        : null,
      reminderCompletion,
    });
  } catch (error) {
    console.error('Mine booking reminder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to load reminder' }, { status: 500 });
  }
}
