import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    console.log('🔄 Medication Fetch All API: Starting fetch all medications...');
    
    // Get the user session (no parameters needed for Next.js 15)
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log('❌ Medication Fetch All API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Medication Fetch All API: User ID:', userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Medication Fetch All API: Connected to MongoDB');

    // Find all medications for this user, sorted by timestamp descending (newest first)
    const medications = await db.collection('medications')
      .find({ userId: userId })
      .sort({ timestamp: -1, createdAt: -1 })
      .toArray();
    
    console.log('🔍 Medication Fetch All API: Found', medications.length, 'medication entries');

    if (!medications || medications.length === 0) {
      console.log('📝 Medication Fetch All API: No medications found for user');
      return NextResponse.json({
        success: true,
        message: 'No medications found',
        medications: [],
        count: 0,
      });
    }

    console.log('✅ Medication Fetch All API: Medications fetched successfully', {
      userId: userId,
      count: medications.length,
      firstEntry: medications[0]?.createdAt,
      lastEntry: medications[medications.length - 1]?.createdAt
    });

    return NextResponse.json({
      success: true,
      message: 'Medications fetched successfully',
      medications: medications,
      count: medications.length,
    });

  } catch (error) {
    console.error('❌ Medication Fetch All API: Error fetching medications:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch medications',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

