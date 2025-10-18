import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '../../../lib/mongodb';

export async function POST(request) {
  try {
    // Get the session to verify user authentication
    const session = await getSession(request);
    
    if (!session || !session.user) {
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
      return NextResponse.json(
        { error: 'Admin or Doctor role required' },
        { status: 403 }
      );
    }

    const { userId, date, time, type, length, notes, rescheduleRequestId } = await request.json();

    if (!userId || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, date, time' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update the user's appointment
    const appointmentUpdate = await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: {
          date: date,
          time: time,
          type: type || 'consultation',
          length: length || '60',
          notes: notes || '',
          updatedAt: new Date(),
          rescheduledBy: user.sub,
          rescheduledAt: new Date(),
          rescheduleRequested: false,
          rescheduleRequestedAt: null
        }
      }
    );

    if (appointmentUpdate.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update the reschedule request status
    if (rescheduleRequestId) {
      await db.collection('rescheduleRequests').updateOne(
        { _id: rescheduleRequestId },
        {
          $set: {
            status: 'rescheduled',
            rescheduledAt: new Date(),
            rescheduledBy: user.sub,
            newDate: date,
            newTime: time,
            newType: type,
            newLength: length,
            notes: notes
          }
        }
      );
    }

    // Get the updated user data
    const updatedUser = await db.collection('users').findOne({ _id: userId });

    return NextResponse.json({
      success: true,
      data: {
        userId: userId,
        appointment: {
          date: date,
          time: time,
          type: type,
          length: length,
          notes: notes
        },
        user: {
          name: updatedUser.name,
          email: updatedUser.email
        },
        rescheduledAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}