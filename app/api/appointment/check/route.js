import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

// GET /api/appointment/check - Check if appointment is configured and get details
export async function GET(request) {
  try {
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get appointment configuration from environment variables
    const isScheduled = process.env.APPOINTMENT_SCHEDULED === 'true';
    const appointmentTime = process.env.APPOINTMENT_TIME;
    const appointmentLength = process.env.APPOINTMENT_LENGTH;
    const appointmentDate = process.env.APPOINTMENT_DATE;
    const appointmentProvider = process.env.APPOINTMENT_PROVIDER;
    const appointmentType = process.env.APPOINTMENT_TYPE;

    // Validate required environment variables
    if (isScheduled && (!appointmentTime || !appointmentLength)) {
      return NextResponse.json({
        success: false,
        error: 'Appointment is marked as scheduled but required environment variables are missing',
        details: {
          APPOINTMENT_TIME: appointmentTime || 'missing',
          APPOINTMENT_LENGTH: appointmentLength || 'missing'
        }
      }, { status: 400 });
    }

    const appointmentData = {
      isScheduled,
      scheduledAt: isScheduled ? (appointmentDate || new Date().toISOString()) : null,
      appointmentDetails: isScheduled ? {
        time: appointmentTime,
        length: appointmentLength,
        date: appointmentDate,
        provider: appointmentProvider || 'Default Provider',
        type: appointmentType || 'consultation'
      } : null,
      status: isScheduled ? 'scheduled' : 'not_scheduled',
      checkedAt: new Date().toISOString(),
      userId: session.user.sub
    };

    return NextResponse.json({
      success: true,
      data: appointmentData
    });

  } catch (error) {
    console.error('Error checking appointment configuration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to check appointment configuration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST /api/appointment/check - Update appointment configuration
export async function POST(request) {
  try {
    const session = await getSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { isScheduled, appointmentTime, appointmentLength, appointmentDate, appointmentProvider, appointmentType } = await request.json();

    // Note: In a real application, you would update a database or external service
    // For now, we'll just return the updated configuration
    const updatedAppointmentData = {
      isScheduled: isScheduled || false,
      scheduledAt: isScheduled ? (appointmentDate || new Date().toISOString()) : null,
      appointmentDetails: isScheduled ? {
        time: appointmentTime,
        length: appointmentLength,
        date: appointmentDate,
        provider: appointmentProvider || 'Default Provider',
        type: appointmentType || 'consultation'
      } : null,
      status: isScheduled ? 'scheduled' : 'not_scheduled',
      updatedAt: new Date().toISOString(),
      userId: session.user.sub
    };

    return NextResponse.json({
      success: true,
      data: updatedAppointmentData,
      message: 'Appointment configuration updated successfully'
    });

  } catch (error) {
    console.error('Error updating appointment configuration:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update appointment configuration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
