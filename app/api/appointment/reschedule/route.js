import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('🔄 Reschedule API: Starting request processing');
    
    // Get the session to verify user authentication
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      console.log('❌ Reschedule API: No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or doctor
    const user = session.user;
    

   
    const userId = user.sub;
    console.log('📋 Reschedule API: Received data:', { userId });


    console.log('🔌 Reschedule API: Connecting to database');
    const db = await getDatabase();
    console.log('✅ Reschedule API: Database connected successfully');

    // Update the user's appointment
    console.log('📝 Reschedule API: Updating user appointment');
    const appointmentUpdate = await db.collection('appointments').updateOne(
      { userId: userId },
      {
        $set: {
          updatedAt: new Date(),
          // Clear reschedule request flags
          rescheduleRequested: true,
          rescheduleRequestedAt: new Date()
        }
      }
    );

    console.log('📊 Reschedule API: Update result:', appointmentUpdate);

    if (appointmentUpdate.matchedCount === 0) {
      console.log('❌ Reschedule API: User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    
    // Get the updated user data
    const appointmentData = await db.collection('appointments').findOne({ userId: userId });
    console.log('✅ Reschedule API: User data fetched successfully');

    const responseData = {
      success: true,
      data: {
        userId: userId,
        appointment: {
          date: appointmentData.date,
          time: appointmentData.time,
          type: appointmentData.type,
          length: appointmentData.length,
          notes: appointmentData.notes,
          rescheduleRequested: appointmentData.rescheduleRequested,
          rescheduleRequestedAt:  appointmentData.rescheduleRequestedAt
        },
        user: {
          name: user?.name,
          email: user?.email
        },
        rescheduledAt: appointmentData.rescheduleRequestedAt
      }
    };

    console.log('✅ Reschedule API: Success response prepared:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('❌ Reschedule API: Error occurred:', error);
    console.error('❌ Reschedule API: Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}