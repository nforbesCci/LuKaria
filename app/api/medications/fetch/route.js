import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔄 Medication Fetch API: Starting medication fetch...');
    
    // Get the user session (no parameters needed for Next.js 15)
    const session = await getSession();
    if (!session || !session.user) {
      console.log('❌ Medication Fetch API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Medication Fetch API: User ID:', userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Medication Fetch API: Connected to MongoDB');

    // Find the most recent medication for this user (sorted by timestamp)
    const medications = await db.collection('medications')
      .find({ userId: userId })
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(1)
      .toArray();
    
    const latestMedication = medications.length > 0 ? medications[0] : null;
    console.log('🔍 Medication Fetch API: Latest medication found:', !!latestMedication);

    if (!latestMedication) {
      console.log('📝 Medication Fetch API: No medications found for user');
      return NextResponse.json({
        success: true,
        message: 'No medications found',
        medication: null,
        exists: false,
      });
    }

    console.log('✅ Medication Fetch API: Latest medication fetched successfully', {
      userId: latestMedication.userId,
      medicationName: latestMedication.medicationName,
      dosage: latestMedication.dosage,
      date: latestMedication.date,
    });

    return NextResponse.json({
      success: true,
      message: 'Medication fetched successfully',
      medication: latestMedication,
      exists: true,
    });

  } catch (error) {
    console.error('❌ Medication Fetch API: Error fetching medication:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch medication',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

