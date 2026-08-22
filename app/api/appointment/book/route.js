import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getCalendarConfig } from '../../../../lib/calendar-config';
import { createInvitee, resolveCalendlyToken, calendlyDefaultTimezone } from '../../../../lib/calendly';
import { getCollection } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

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
    if (!eventTypeUri || !startTime) {
      return NextResponse.json(
        { error: 'eventTypeUri and startTime are required' },
        { status: 400 },
      );
    }

    const email = session.user.email;
    if (!email) {
      return NextResponse.json(
        { error: 'Your account needs an email to book an appointment' },
        { status: 400 },
      );
    }

    const config = await getCalendarConfig();
    const allowedType = (config.appointmentTypes || []).find(
      (t) => t.enabled !== false && t.eventTypeUri === eventTypeUri,
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
      name: session.user.name || email,
      email,
      timezone: body.timezone || calendlyDefaultTimezone(),
    });

    const startDate = new Date(startTime);
    const durationMin = allowedType.durationMinutes || 30;
    const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);

    const appointmentsCollection = await getCollection('appointments');
    const userId = session.user.sub;
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
      userName: session.user.name,
      rawData: { invitee, eventTypeUri, startTime },
    };

    await appointmentsCollection.updateOne(
      { userId },
      {
        $set: appointmentDocument,
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true },
    );

    return NextResponse.json({
      success: true,
      message: 'Appointment booked',
      appointment: {
        startTime: appointmentDocument.startTime,
        endTime: appointmentDocument.endTime,
        type: appointmentDocument.type,
        date: appointmentDocument.date,
        time: appointmentDocument.time,
      },
      invitee,
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
