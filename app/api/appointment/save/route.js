import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';
import { getCollection } from '../../../../lib/mongodb';

// POST /api/appointment/save - Save/update appointment to MongoDB
export async function POST(request) {
  console.log('🔍 API Route Called: POST /api/appointment/save');
  
  try {
    const session = await getSession(request);
    
    console.log('👤 Session:', session ? 'Found' : 'Not found');
    console.log('👤 User:', session?.user?.sub || 'No user');
    
    if (!session || !session.user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentData = await request.json();
    const userId = session.user.sub;
    
    console.log('📥 Received appointment data:', JSON.stringify(appointmentData, null, 2));
    console.log('✅ User ID:', userId);

    // Validate required fields
    if (!appointmentData) {
      return NextResponse.json(
        { error: 'Appointment data is required' },
        { status: 400 }
      );
    }

    // Get appointments collection from MongoDB
    const appointmentsCollection = await getCollection('appointments');
    
    // Prepare appointment document for database
    const appointmentDocument = {
      userId,
      isScheduled: true,
      time: appointmentData?.startDate ? new Date(appointmentData.startDate).toLocaleTimeString("en-CA", { timeZone: "America/Jamaica",  hour: "2-digit", minute: "2-digit" }) : null,
      length: (appointmentData?.endDate && appointmentData?.startDate) ? 
        Math.round((new Date(appointmentData.endDate) - new Date(appointmentData.startDate)) / (1000 * 60)).toString() : '60',
      date: appointmentData?.startDate ? new Date(appointmentData.startDate).toLocaleDateString("en-CA", {
        timeZone: "America/Jamaica",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) : (appointmentData.date || appointmentData.appointmentDate),
      provider: appointmentData.provider || appointmentData.practitioner || 'Default Provider',
      type: appointmentData.type || 'consultation',
      scheduledAt: appointmentData.scheduledAt || new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Jamaica",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: 'scheduled',
      updatedAt: new Date().toISOString(),
      userEmail: session.user.email,
      userName: session.user.name,
      // Store all raw appointment data
      rawData: appointmentData
    };

    console.log('💾 Saving to MongoDB...');
    console.log('📄 Document to save:', JSON.stringify(appointmentDocument, null, 2));
    
    // Upsert (update or insert) the appointment in MongoDB
    const result = await appointmentsCollection.updateOne(
      { userId },
      { 
        $set: appointmentDocument,
        $setOnInsert: { createdAt: new Date().toISOString() }
      },
      { upsert: true }
    );
    
    console.log('✅ MongoDB operation completed:', {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount
    });

    const responseData = {
      isScheduled: true,
      scheduledAt: appointmentDocument.scheduledAt,
      appointmentDetails: {
        time: appointmentDocument.time,
        length: appointmentDocument.length,
        date: appointmentDocument.date,
        provider: appointmentDocument.provider,
        type: appointmentDocument.type
      },
      status: 'scheduled',
      updatedAt: appointmentDocument.updatedAt,
      userId,
      dbOperation: result.upsertedCount > 0 ? 'created' : 'updated',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    };

    console.log('✅ Returning response data:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json({
      success: true,
      data: responseData,
      message: result.upsertedCount > 0 
        ? 'Appointment created successfully in database' 
        : 'Appointment updated successfully in database'
    });

  } catch (error) {
    console.error('❌ Error saving appointment:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to save appointment to database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
