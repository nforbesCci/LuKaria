import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/mongodb';

// GET /api/appointment/check - Check if appointment is configured and get details
export async function GET(request) {
  console.log('🔍 API Route Called: GET /api/appointment/check');
  
  try {
    const session = await getSession(request);
    
    console.log('👤 Session:', session ? 'Found' : 'Not found');
    console.log('👤 User:', session?.user?.sub || 'No user');
    
    if (!session || !session.user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('✅ User ID:', userId);

    // Get appointments collection from MongoDB
    console.log('📊 Connecting to MongoDB...');
    const appointmentsCollection = await getCollection('appointments');
    console.log('✅ Connected to appointments collection');
    
    // Find the user's appointment in the database
    console.log('🔍 Searching for appointment with userId:', userId);
    const userAppointment = await appointmentsCollection.findOne({ userId });
    console.log('📋 Appointment found:', userAppointment ? 'Yes' : 'No');
    
    if (userAppointment) {
      console.log('📄 Appointment data:', JSON.stringify(userAppointment, null, 2));
    }

    // Extract appointment data from database or use defaults
    const appointmentTime = userAppointment?.time || null;
    const appointmentLength = (userAppointment?.rawData?.startDate && userAppointment?.rawData?.endDate)? userAppointment?.rawData?.endDate - userAppointment?.rawData?.startDate : null;
    const appointmentDate = userAppointment?.rawData?.startDate || null;
    const appointmentEndDate = userAppointment?.rawData?.endDate || null;
    const appointmentProvider = userAppointment?.provider || null;
    const appointmentType = userAppointment?.type || null;
   
    // Determine if appointment is actually scheduled based on data completeness
    // Only consider scheduled if we have both time and length
    const isScheduled = userAppointment?.isScheduled;
   
    // Log warning if data is incomplete
    if (userAppointment?.isScheduled && (!appointmentTime || !appointmentLength)) {
      console.warn('⚠️ Appointment marked as scheduled but missing required fields:', {
        userId,
        time: appointmentTime || 'missing',
        length: appointmentLength || 'missing'
      });
    }

    const appointmentData = {
      isScheduled,
      scheduledAt: isScheduled ? (appointmentDate || userAppointment?.scheduledAt || new Date().toISOString()) : null,
      appointmentDetails: isScheduled ? {
        time: appointmentTime,
        length: appointmentLength,
        date: appointmentDate,
        provider: appointmentProvider || 'Default Provider',
        type: appointmentType || 'consultation',
        rescheduleRequested: userAppointment?.rescheduleRequested || false,
        rescheduleRequestedAt: userAppointment?.rescheduleRequestedAt || null
      } : null,
      status: isScheduled ? 'scheduled' : 'not_scheduled',
      checkedAt: new Date().toISOString(),
      userId,
      source: userAppointment ? 'database' : 'not_found',
      rescheduleRequested: userAppointment?.rescheduleRequested || false,
      rescheduleRequestedAt: userAppointment?.rescheduleRequestedAt || null
    };

    console.log('✅ Returning appointment data:', JSON.stringify(appointmentData, null, 2));
    
    return NextResponse.json({
      success: true,
      data: appointmentData
    });

  } catch (error) {
    console.error('❌ Error checking appointment configuration:', error);
    console.error('❌ Error stack:', error.stack);
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
    const userId = session.user.sub;

    // Get appointments collection from MongoDB
    const appointmentsCollection = await getCollection('appointments');
    
    // Prepare appointment document for database
    const appointmentDocument = {
      userId,
      isScheduled: isScheduled || false,
      time: appointmentTime,
      length: appointmentLength,
      date: appointmentDate,
      provider: appointmentProvider || 'Default Provider',
      type: appointmentType || 'consultation',
      scheduledAt: isScheduled ? (appointmentDate || new Date().toISOString()) : null,
      status: isScheduled ? 'scheduled' : 'not_scheduled',
      updatedAt: new Date().toISOString(),
      userEmail: session.user.email,
      userName: session.user.name
    };

    // Upsert (update or insert) the appointment in MongoDB
    const result = await appointmentsCollection.updateOne(
      { userId },
      { 
        $set: appointmentDocument,
        $setOnInsert: { createdAt: new Date().toISOString() }
      },
      { upsert: true }
    );

    const updatedAppointmentData = {
      isScheduled: appointmentDocument.isScheduled,
      scheduledAt: appointmentDocument.scheduledAt,
      appointmentDetails: {
        time: appointmentDocument.time,
        length: appointmentDocument.length,
        date: appointmentDocument.date,
        provider: appointmentDocument.provider,
        type: appointmentDocument.type
      },
      status: appointmentDocument.status,
      updatedAt: appointmentDocument.updatedAt,
      userId,
      dbOperation: result.upsertedCount > 0 ? 'inserted' : 'updated'
    };

    return NextResponse.json({
      success: true,
      data: updatedAppointmentData,
      message: result.upsertedCount > 0 
        ? 'Appointment created successfully' 
        : 'Appointment updated successfully'
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
