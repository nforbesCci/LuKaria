import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../lib/api-auth';
import { getCalendarConfig, resolveBookableAppointmentTypes } from '../../../../lib/calendar-config';
import { createInvitee, resolveCalendlyToken, calendlyDefaultTimezone } from '../../../../lib/calendly';
import { getCollection } from '../../../../lib/mongodb';
import { getManagementClient } from '../../../../lib/auth0-management';
import { completeBookingRemindersForUser } from '../../../../lib/booking-reminders';

export const dynamic = 'force-dynamic';

function decodeUserId(raw) {
  if (!raw) return '';
  let id = String(raw);
  try {
    while (id.includes('%')) {
      const next = decodeURIComponent(id);
      if (next === id) break;
      id = next;
    }
  } catch {
    // keep current
  }
  return id;
}

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const eventTypeUri = body.eventTypeUri;
    const startTime = body.startTime;
    const typeName = body.typeName || body.type || 'consultation';
    const timezone = body.timezone || calendlyDefaultTimezone();
    const forUserIdRaw = body.forUserId || body.userId || null;
    if (!eventTypeUri || !startTime) {
      return NextResponse.json(
        { error: 'eventTypeUri and startTime are required' },
        { status: 400 },
      );
    }

    let userId = session.user.sub;
    let email = session.user.email;
    let name = session.user.name || email;

    const forUserId = decodeUserId(forUserIdRaw);
    if (forUserId && forUserId !== session.user.sub) {
      if (!hasAdminOrDoctorRole(session.user)) {
        return NextResponse.json(
          { error: 'Only clinic staff can book for another patient' },
          { status: 403 },
        );
      }
      const management = getManagementClient();
      const auth0User = await management.users.get(forUserId);
      const u = auth0User?.data || auth0User;
      email = u?.email;
      name = u?.name || u?.nickname || email;
      userId = forUserId;
      if (!email) {
        return NextResponse.json(
          { error: 'Patient account needs an email to book an appointment' },
          { status: 400 },
        );
      }
    } else if (!email) {
      return NextResponse.json(
        { error: 'Your account needs an email to book an appointment' },
        { status: 400 },
      );
    }

    const config = await getCalendarConfig();
    const allowedType = (await resolveBookableAppointmentTypes(config)).find(
      (t) => t.eventTypeUri === eventTypeUri,
    );
    if (!allowedType) {
      return NextResponse.json(
        { error: 'This appointment type is not available for booking' },
        { status: 403 },
      );
    }

    const token = await resolveCalendlyToken(config.apiToken);
    const invitee = await createInvitee(token, {
      eventTypeUri,
      startTime,
      name: name || email,
      email,
      timezone,
    });

    const startDate = new Date(startTime);
    const durationMin = allowedType.durationMinutes || 30;
    const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);

    const appointmentsCollection = await getCollection('appointments');
    const appointmentDocument = {
      userId,
      isScheduled: true,
      time: startDate.toLocaleTimeString('en-CA', {
        timeZone: 'America/Jamaica',
        hour: '2-digit',
        minute: '2-digit',
      }),
      length: String(durationMin),
      date: startDate.toLocaleDateString('en-CA', {
        timeZone: 'America/Jamaica',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      provider: 'LuKaria',
      type: allowedType.name || typeName,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      status: 'scheduled',
      source: 'calendly_api',
      calendlyInviteeUri: invitee?.uri || null,
      calendlyEventUri: invitee?.event || null,
      updatedAt: new Date().toISOString(),
      userEmail: email,
      userName: name,
      bookedByUserId: session.user.sub,
      bookedByEmail: session.user.email || null,
      rawData: { invitee, eventTypeUri, startTime, forUserId: forUserId || null },
    };

    await appointmentsCollection.updateOne(
      { userId },
      {
        $set: appointmentDocument,
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true },
    );

    // Stop reminder alerts until the doctor schedules a new reminder window.
    let reminderCompletion = null;
    try {
      reminderCompletion = await completeBookingRemindersForUser(userId, {
        reason: 'appointment_booked',
      });
    } catch (reminderErr) {
      console.error('Failed to complete booking reminders after book:', reminderErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment booked',
      appointment: {
        startTime: appointmentDocument.startTime,
        endTime: appointmentDocument.endTime,
        type: appointmentDocument.type,
        date: appointmentDocument.date,
        time: appointmentDocument.time,
        userId,
      },
      invitee,
      reminderCompletion,
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    const status = error.status && error.status >= 400 && error.status < 600 ? error.status : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to book appointment', details: error.payload },
      { status },
    );
  }
}
