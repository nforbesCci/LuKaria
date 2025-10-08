import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { ObjectId } from 'mongodb';
import clientPromise from '../../../../lib/mongodb';

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

    const userId = session.user.sub;
    console.log('👤 API: User ID:', userId);

    // Parse request body
    const { appointmentId, status } = await request.json();
    console.log('📥 API: Reschedule data received:', { appointmentId, status });

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const collection = db.collection('appointments');
     // Get appointment data
    // Update appointment status to "request appointment"
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
      { sort: { createdAt: -1 } } // Update the most recent if no ID provided
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

  } catch (error) {
    console.error('❌ API: Error processing reschedule request:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process reschedule request' },
      { status: 500 }
    );
  }
}

