import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('📤 API: Received notification send request');
    
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
    const notificationData = await request.json();
    console.log('📥 API: Notification data received:', notificationData);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('LukariaDB');
    const collection = db.collection('NotificationCollection');

    // Prepare notification document
    const notification = {
      userId,
      userEmail: session.user.email || null,
      userName: session.user.name || null,
      type: notificationData.type || 'general',
      details: notificationData.details || '',
      message: notificationData.message || '',
      timestamp: notificationData.timestamp || new Date().toISOString(),
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('💾 API: Saving notification to database:', notification);

    // Insert notification into database
    const result = await collection.insertOne(notification);

    console.log('✅ API: Notification saved successfully with ID:', result.insertedId);

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        _id: result.insertedId,
      },
    });

  } catch (error) {
    console.error('❌ API: Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send notification' },
      { status: 500 }
    );
  }
}

