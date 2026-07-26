import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    console.log('🔄 Measurements Save API: Starting measurements save...');
    
    // Parse request body first
    const measurementsData = await request.json();
    
    // Get the user session (no parameters for Next.js 15)
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log('❌ Measurements Save API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const userEmail = session.user.email;
    console.log('👤 Measurements Save API: User ID:', userId);
    console.log('📊 Measurements Save API: Measurements data:', measurementsData);
    
    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Measurements Save API: Connected to MongoDB');

    // Use provided date or current date
    const measurementDate = measurementsData.date ? new Date(measurementsData.date) : new Date();
    // Normalize to start of day for consistency
    measurementDate.setHours(0, 0, 0, 0);
    const dateKey = measurementDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    console.log('📅 Measurements Save API: Date for measurement:', dateKey);

    // Prepare the document to save
    const document = {
      userId: userId,
      userEmail: userEmail,
      weight: measurementsData.weight,
      heightFeet: measurementsData.heightFeet,
      heightInches: measurementsData.heightInches || 0,
      waistCircumference: measurementsData.waistCircumference || null,
      bmi: measurementsData.bmi,
      bmiCategory: measurementsData.bmiCategory,
      notes: measurementsData.notes || '',
      dateKey: dateKey, // Store date key for easy querying
      updatedAt: new Date()
    };

    // Check if measurement already exists for this user on this date
    const existingMeasurement = await db.collection('measurements').findOne({ 
      userId: userId,
      dateKey: dateKey 
    });
    
    let result;
    if (existingMeasurement) {
      // Update existing measurement for this date (only one per day allowed)
      result = await db.collection('measurements').updateOne(
        { 
          userId: userId,
          dateKey: dateKey 
        },
        { 
          $set: {
            ...document,
            createdAt: existingMeasurement.createdAt // Preserve original creation date
          }
        }
      );
      console.log('✅ Measurements Save API: Measurement updated for date:', dateKey);
    } else {
      // Insert new measurement for this date
      document.createdAt = new Date();
      result = await db.collection('measurements').insertOne(document);
      console.log('✅ Measurements Save API: Measurement created for date:', dateKey);
    }

    return NextResponse.json({
      success: true,
      message: existingMeasurement ? 'Measurement updated successfully' : 'Measurement saved successfully',
      measurementsId: result.insertedId || existingMeasurement?._id,
      measurements: document
    });

  } catch (error) {
    console.error('❌ Measurements Save API: Error saving measurements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save measurements',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
