import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('🔄 Measurements Fetch API: Starting measurements fetch...');
    
    // Get the user session (no parameters needed for Next.js 15)
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log('❌ Measurements Fetch API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Measurements Fetch API: User ID:', userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Measurements Fetch API: Connected to MongoDB');

    // Find the most recent measurement for this user (sorted by dateKey and createdAt)
    const measurements = await db.collection('measurements')
      .find({ userId: userId })
      .sort({ dateKey: -1, createdAt: -1 })
      .limit(1)
      .toArray();
    
    const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
    console.log('🔍 Measurements Fetch API: Latest measurement found:', !!latestMeasurement);

    if (!latestMeasurement) {
      console.log('📝 Measurements Fetch API: No measurements found for user');
      return NextResponse.json({
        success: true,
        message: 'No measurements found',
        measurements: null,
        exists: false,
      });
    }

    console.log('✅ Measurements Fetch API: Latest measurement fetched successfully', {
      userId: latestMeasurement.userId,
      weight: latestMeasurement.weight,
      heightFeet: latestMeasurement.heightFeet,
      bmi: latestMeasurement.bmi,
      dateKey: latestMeasurement.dateKey,
    });

    return NextResponse.json({
      success: true,
      message: 'Measurements fetched successfully',
      measurements: latestMeasurement,
      exists: true,
    });

  } catch (error) {
    console.error('❌ Measurements Fetch API: Error fetching measurements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch measurements',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
