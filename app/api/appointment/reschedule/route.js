import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('🔄 API: Received reschedule request');
    
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      console.error('❌ API: User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('📥 API: Reschedule data received:', body);

    // Check if this is an admin reschedule (has userId and appointmentData)
    if (body.userId && body.appointmentData) {
      // Admin reschedule - check admin permissions
      const adminGroups = session.user.groups || session.user['https://lukariagroup.com/roles'] || [];
      const isAdmin = adminGroups.includes('Admin') || adminGroups.includes('Doctor');
      
      console.log('🔐 API: Admin groups:', adminGroups);
      console.log('🔐 API: Is admin:', isAdmin);
      
      if (!isAdmin) {
        console.error('❌ API: User is not authorized to reschedule for others');
        return NextResponse.json(
          { success: false, error: 'Not authorized' },
          { status: 403 }
        );
      }

      console.log('👤 API: Admin rescheduling for user:', body.userId);
      console.log('📋 API: Appointment data to save:', JSON.stringify(body.appointmentData, null, 2));
      
      // Update user profile with new appointment data
      const db = await getDatabase();
      
     
      
      const result = await db.collection('appointments').updateOne(
        { userId: body.userId },
        { 
          $set: { 
            isScheduled: true,
            date: body.appointmentData.date,
            time: body.appointmentData.time,
            length: body.appointmentData.length,
            rawData: { startDate: new Date(body.appointmentData.date),
               endDate: new Date(body.appointmentData.date).toISOString() + body.appointmentData.length },
            scheduledAt: new Date(),
            type: body.appointmentData.type,
          }
        },
        { upsert: true }
      );

      console.log('✅ API: Appointment updated successfully');
      console.log('📊 API: Update result:', {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
        upsertedId: result.upsertedId
      });

      return NextResponse.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        result: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
          upsertedId: result.upsertedId
        },
      });
    } else {
      // User reschedule request - original functionality
      const userId = session.user.sub;
      console.log('👤 API: User ID:', userId);

      const { appointmentId, status } = body;
      
      const db = await getDatabase();
      const collection = db.collection('appointments');
      
      console.log('💾 API: Updating appointment status to:', status);
          
      const query = { userId: userId };
      
      console.log('🔍 API: Query:', query);
      
      const result = await collection.updateOne(
        query,
        {
          $set: {
            status: status || 'request appointment',
            rescheduleRequested: true,
            rescheduleRequestedAt: new Date().toISOString(),
            updatedAt: new Date(),
          },
        },
        { sort: { createdAt: -1 } }
      );

      if (result.matchedCount === 0) {
        console.error('❌ API: No appointment found to update');
        return NextResponse.json(
          { success: false, error: 'No appointment found' },
          { status: 404 }
        );
      }

      console.log('✅ API: Appointment status updated successfully');

      return NextResponse.json({
        success: true,
        message: 'Reschedule request processed successfully',
        result: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
      });
    }

  } catch (error) {
    console.error('❌ API: Error processing reschedule request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process reschedule request' },
      { status: 500 }
    );
  }
}

