import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔄 Measurements Fetch All API: Starting fetch all measurements...');
    
    // Get the user session (no parameters needed for Next.js 15)
    const session = await getSession();
    if (!session || !session.user) {
      console.log('❌ Measurements Fetch All API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Measurements Fetch All API: User ID:', userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Measurements Fetch All API: Connected to MongoDB');

    // Find all measurements for this user, sorted by dateKey descending (newest first)
    const measurements = await db.collection('measurements')
      .find({ userId: userId })
      .sort({ dateKey: -1, createdAt: -1 })
      .toArray();
    
    console.log('🔍 Measurements Fetch All API: Found', measurements.length, 'measurement entries');

    if (!measurements || measurements.length === 0) {
      console.log('📝 Measurements Fetch All API: No measurements found for user');
      return NextResponse.json({
        success: true,
        message: 'No measurements found',
        measurements: [],
        count: 0,
      });
    }

    console.log('✅ Measurements Fetch All API: Measurements fetched successfully', {
      userId: userId,
      count: measurements.length,
      firstEntry: measurements[0]?.createdAt,
      lastEntry: measurements[measurements.length - 1]?.createdAt
    });

    return NextResponse.json({
      success: true,
      message: 'Measurements fetched successfully',
      measurements: measurements,
      count: measurements.length,
    });

  } catch (error) {
    console.error('❌ Measurements Fetch All API: Error fetching measurements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch measurements',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

