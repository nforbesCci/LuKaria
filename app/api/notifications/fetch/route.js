import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = session.user.sub;
    const db = await getDatabase();
    const collection = db.collection('NotificationCollection');

    const notifications = await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Notification fetch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications' },
      { status: 500 },
    );
  }
}
