/**
 * Next-appointment booking reminders (doctor-scheduled, 7-day window).
 */

import { getDatabase } from './mongodb';

export const BOOKING_REMINDER_TYPE = 'book_next_appointment';
export const BOOKING_REMINDER_TITLE = 'Book your next appointment';
export const BOOKING_REMINDER_MESSAGE =
  'Please book your next visit with Dr Kadria Fairclough. Open Schedule in the app to choose a time.';

function pad(n) {
  return String(n).padStart(2, '0');
}

/** Local calendar YYYY-MM-DD in America/Jamaica (clinic timezone). */
export function todayIsoInClinicTz(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Jamaica' });
}

export function addDaysIso(iso, days) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) throw new Error('Invalid date');
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

export function buildReminderWindow(startDateIso) {
  const startDate = String(startDateIso || '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error('startDate must be YYYY-MM-DD');
  }
  return {
    startDate,
    endDate: addDaysIso(startDate, 6),
    active: true,
  };
}

export function isDateInReminderWindow(reminder, dayIso = todayIsoInClinicTz()) {
  if (!reminder?.active || !reminder.startDate || !reminder.endDate) return false;
  return dayIso >= reminder.startDate && dayIso <= reminder.endDate;
}

export async function insertBookingReminderNotification(userId, { dayIso, setBy } = {}) {
  const db = await getDatabase();
  const day = dayIso || todayIsoInClinicTz();
  const existing = await db.collection('NotificationCollection').findOne({
    userId,
    type: BOOKING_REMINDER_TYPE,
    reminderDay: day,
  });
  if (existing) return { inserted: false, notification: existing };

  const notification = {
    userId,
    type: BOOKING_REMINDER_TYPE,
    title: BOOKING_REMINDER_TITLE,
    message: BOOKING_REMINDER_MESSAGE,
    details: 'Doctor-scheduled booking reminder',
    reminderDay: day,
    setBy: setBy || null,
    timestamp: new Date().toISOString(),
    read: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const result = await db.collection('NotificationCollection').insertOne(notification);
  return {
    inserted: true,
    notification: { ...notification, _id: result.insertedId },
  };
}

/**
 * Create today's notification for every patient whose reminder window includes today
 * and who has not already been notified for this day.
 */
export async function processDueBookingReminders() {
  const db = await getDatabase();
  const today = todayIsoInClinicTz();
  const profiles = await db
    .collection('profiles')
    .find({
      'nextBookingReminder.active': true,
      'nextBookingReminder.startDate': { $lte: today },
      'nextBookingReminder.endDate': { $gte: today },
    })
    .toArray();

  const results = [];
  for (const profile of profiles) {
    const userId = profile.userId;
    if (!userId) continue;
    const reminder = profile.nextBookingReminder || {};
    if (reminder.lastNotifiedDate === today) {
      results.push({ userId, skipped: true, reason: 'already_notified' });
      continue;
    }
    const { inserted, notification } = await insertBookingReminderNotification(userId, {
      dayIso: today,
      setBy: reminder.setBy,
    });
    await db.collection('profiles').updateOne(
      { userId },
      {
        $set: {
          'nextBookingReminder.lastNotifiedDate': today,
          updatedAt: new Date(),
        },
      },
    );
    results.push({ userId, inserted, notificationId: notification?._id });
  }

  // Auto-deactivate windows that have ended
  await db.collection('profiles').updateMany(
    {
      'nextBookingReminder.active': true,
      'nextBookingReminder.endDate': { $lt: today },
    },
    {
      $set: {
        'nextBookingReminder.active': false,
        updatedAt: new Date(),
      },
    },
  );

  return { today, processed: results.length, results };
}
