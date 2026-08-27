import { NextResponse } from 'next/server';
import { processDueBookingReminders } from '../../../../lib/booking-reminders';

export const dynamic = 'force-dynamic';

/**
 * Daily job: create in-app (and mobile-syncable) booking reminders for patients
 * whose doctor-set window includes today.
 *
 * Secure with CRON_SECRET header: Authorization: Bearer <CRON_SECRET>
 * or x-cron-secret: <CRON_SECRET>
 * Vercel Cron sends Authorization: Bearer <CRON_SECRET> when configured.
 */
export async function GET(request) {
  try {
    const secret = process.env.CRON_SECRET?.trim();
    const auth = request.headers.get('authorization') || '';
    const headerSecret = request.headers.get('x-cron-secret') || '';
    const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (secret && bearer !== secret && headerSecret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await processDueBookingReminders();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Booking reminder cron error:', error);
    return NextResponse.json({ error: error.message || 'Cron failed' }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
