import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import clientPromise from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    console.log('📥 API: Received notification fetch request');
    
    // Get user session
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      console.error('❌ API: User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    console.log('👤 API: User ID:', userId);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('LukariaDB');
    const collection = db.collection('NotificationCollection');

    console.log('🔍 API: Fetching notifications for user:', userId);

    // Fetch notifications for the user, sorted by timestamp (newest first).
    // Hide completed booking reminders (e.g. after patient schedules).
    const notifications = await collection
      .find({
        userId,
        $or: [
          { type: { $ne: 'book_next_appointment' } },
          { type: 'book_next_appointment', completed: { $ne: true } },
        ],
      })
      .sort({ timestamp: -1 })
      .toArray();

    console.log(`✅ API: Found ${notifications.length} notifications`);

    return NextResponse.json({
      success: true,
      notifications,
    });

  } catch (error) {
    console.error('❌ API: Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

