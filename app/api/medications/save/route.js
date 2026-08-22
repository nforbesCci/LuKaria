import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('🔄 Medication Save API: Starting medication save...');
    
    // Parse request body first
    const medicationData = await request.json();
    
    // Get the user session (no parameters for Next.js 15)
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log('❌ Medication Save API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const userEmail = session.user.email;
    console.log('👤 Medication Save API: User ID:', userId);
    console.log('💊 Medication Save API: Medication data:', medicationData);
    
    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Medication Save API: Connected to MongoDB');

    // Create timestamp for this entry
    const timestamp = new Date();

    // Normalize date to start of day for consistent querying
    const dateKey = medicationData.date; // Format: YYYY-MM-DD

    // Prepare the document to save
    const dosage = medicationData.dosage ?? medicationData.dose ?? '';
    const document = {
      userId: userId,
      userEmail: userEmail,
      medicationName: medicationData.medicationName,
      dosage,
      dose: dosage,
      date: dateKey,
      time: medicationData.time || null,
      notes: medicationData.notes || '',
      taken: medicationData.taken !== false,
      timestamp: timestamp,
      updatedAt: timestamp
    };

    console.log('🔍 Checking for existing medication on date:', dateKey);

    // Check if medication already exists for this user and date
    const existingMedication = await db.collection('medications').findOne({
      userId: userId,
      date: dateKey
    });

    let result;
    let message;

    if (existingMedication) {
      // Update existing medication entry
      console.log('📝 Updating existing medication entry');
      result = await db.collection('medications').updateOne(
        { userId: userId, date: dateKey },
        { $set: document }
      );
      message = 'Medication entry updated successfully';
      console.log('✅ Medication Save API: Medication entry updated successfully');
    } else {
      // Insert new medication entry
      console.log('📝 Creating new medication entry');
      document.createdAt = timestamp;
      result = await db.collection('medications').insertOne(document);
      message = 'Medication entry created successfully';
      console.log('✅ Medication Save API: Medication entry created successfully');
    }

    return NextResponse.json({
      success: true,
      message: message,
      medicationId: result.insertedId || existingMedication?._id,
      medication: document,
      isUpdate: !!existingMedication
    });

  } catch (error) {
    console.error('❌ Medication Save API: Error saving medication:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save medication',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

