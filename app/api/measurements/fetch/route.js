import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    console.log('🔄 Measurements Fetch API: Starting measurements fetch...');
    
    // Get the user session
    const session = await getSession(request);
    if (!session || !session.user) {
      console.log('❌ Measurements Fetch API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Measurements Fetch API: User ID:', userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Measurements Fetch API: Connected to MongoDB');

    // Find the measurements for this user
    const measurements = await db.collection('measurements').findOne({ userId: userId });
    console.log('🔍 Measurements Fetch API: Measurements found:', !!measurements);

    if (!measurements) {
      console.log('📝 Measurements Fetch API: No measurements found for user');
      return NextResponse.json({
        success: true,
        message: 'No measurements found',
        measurements: null,
        exists: false,
      });
    }

    console.log('✅ Measurements Fetch API: Measurements fetched successfully', {
      userId: measurements.userId,
      weight: measurements.weight,
      heightFeet: measurements.heightFeet,
      bmi: measurements.bmi,
    });

    return NextResponse.json({
      success: true,
      message: 'Measurements fetched successfully',
      measurements: measurements,
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
