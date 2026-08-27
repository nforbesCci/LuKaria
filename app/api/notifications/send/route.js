import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const notificationData = await request.json();
    const isStaff = hasAdminOrDoctorRole(session.user);
    const targetUserId =
      isStaff && notificationData.userId ? String(notificationData.userId) : session.user.sub;

    const db = await getDatabase();
    const collection = db.collection('NotificationCollection');

    const notification = {
      userId: targetUserId,
      userEmail: notificationData.userEmail || session.user.email || null,
      userName: notificationData.userName || session.user.name || null,
      type: notificationData.type || 'general',
      title: notificationData.title || null,
      details: notificationData.details || '',
      message: notificationData.message || '',
      timestamp: notificationData.timestamp || new Date().toISOString(),
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: session.user.sub,
    };

    const result = await collection.insertOne(notification);

    return NextResponse.json({
      success: true,
      notification: {
        ...notification,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error('Notification send error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send notification' },
      { status: 500 },
    );
  }
}
