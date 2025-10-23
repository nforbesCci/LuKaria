import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('🔄 Reschedule API: Starting request processing');
    
    // Get the session to verify user authentication
    const session = await getSession(request);
    
    if (!session || !session.user) {
      console.log('❌ Reschedule API: No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin or doctor
    const user = session.user;
    const isAdmin = user.groups && (
      user.groups.includes('Admin') || 
      user.groups.includes('Doctor')
    ) || (
      user['https://lukariagroup.com/roles'] && (
        user['https://lukariagroup.com/roles'].includes('Admin') || 
        user['https://lukariagroup.com/roles'].includes('Doctor')
      )
    );

    if (!isAdmin) {
      console.log('❌ Reschedule API: User is not admin/doctor');
      return NextResponse.json(
        { error: 'Admin or Doctor role required' },
        { status: 403 }
      );
    }

    const { userId, appointmentData } = await request.json();
    console.log('📋 Reschedule API: Received data:', { userId, appointmentData });

    if (!userId || !appointmentData || !appointmentData.date || !appointmentData.time) {
      console.log('❌ Reschedule API: Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: userId, appointmentData with date and time' },
        { status: 400 }
      );
    }

    console.log('🔌 Reschedule API: Connecting to database');
    const db = await getDatabase();
    console.log('✅ Reschedule API: Database connected successfully');

    // Update the user's appointment
    console.log('📝 Reschedule API: Updating user appointment');
    const appointmentUpdate = await db.collection('appointments').updateOne(
      { userId: userId },
      {
        $set: {
          date: appointmentData.date,
          time: appointmentData.time,
          type: appointmentData.type || 'consultation',
          length: appointmentData.length || '60',
          notes: appointmentData.notes || '',
          rawData:{
            startDate: new Date(`${appointmentData.date.split('T')[0]}T${appointmentData.time}`),
            endDate: (() => {
              const startDateTime = new Date(`${appointmentData.date.split('T')[0]}T${appointmentData.time}`);
              const lengthMinutes = parseInt(appointmentData.length || '60');
              return new Date(startDateTime.getTime() + (lengthMinutes * 60 * 1000));
            })()
          },
          updatedAt: new Date(),
          rescheduledBy: user.sub,
          rescheduledAt: new Date(),
          // Clear reschedule request flags
          rescheduleRequested: false,
          rescheduleRequestedAt: null
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
    const updatedUser = await db.collection('appointments').findOne({ userId: userId });
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
          notes: appointmentData.notes
        },
        user: {
          name: updatedUser?.name,
          email: updatedUser?.email
        },
        rescheduledAt: new Date()
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