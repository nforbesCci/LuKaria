import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('🔄 Measurements Save API: Starting measurements save...');
    
    // Get the user session
    const session = await getSession(request);
    if (!session || !session.user) {
      console.log('❌ Measurements Save API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    const userEmail = session.user.email;
    console.log('👤 Measurements Save API: User ID:', userId);

    // Parse request body
    const measurementsData = await request.json();
    console.log('📊 Measurements Save API: Measurements data:', measurementsData);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Measurements Save API: Connected to MongoDB');

    // Prepare the document to save
    const document = {
      userId: userId,
      userEmail: userEmail,
      weight: measurementsData.weight,
      heightFeet: measurementsData.heightFeet,
      heightInches: measurementsData.heightInches || 0,
      bmi: measurementsData.bmi,
      bmiCategory: measurementsData.bmiCategory,
      date: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Check if measurements already exist for this user
    const existingMeasurements = await db.collection('measurements').findOne({ userId: userId });
    
    let result;
    if (existingMeasurements) {
      // Update existing measurements
      result = await db.collection('measurements').updateOne(
        { userId: userId },
        { 
          $set: {
            ...document,
            createdAt: existingMeasurements.createdAt // Preserve original creation date
          }
        }
      );
      console.log('✅ Measurements Save API: Measurements updated successfully');
    } else {
      // Insert new measurements
      result = await db.collection('measurements').insertOne(document);
      console.log('✅ Measurements Save API: Measurements created successfully');
    }

    return NextResponse.json({
      success: true,
      message: existingMeasurements ? 'Measurements updated successfully' : 'Measurements saved successfully',
      measurementsId: result.insertedId || existingMeasurements?._id,
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
