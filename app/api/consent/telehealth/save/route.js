import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { getSession } from '@auth0/nextjs-auth0';

export async function POST(request) {
  try {
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const consentData = await request.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const collection = db.collection('TelehealthCollection');

    // Prepare document to save
    const document = {
      userId,
      patientName: consentData.patientName,
      patientDOB: consentData.patientDOB,
      consentDate: consentData.consentDate,
      signature: consentData.signature,
      complete: consentData.complete === true ? true : false,
      available: true,
      updatedAt: new Date(),
    };

    // Add createdAt only for new documents
    const existingDocument = await collection.findOne({ userId });
    if (!existingDocument) {
      document.createdAt = new Date();
    }

    // Upsert the document (update if exists, insert if not)
    const result = await collection.updateOne(
      { userId },
      { $set: document },
      { upsert: true }
    );

    console.log('✅ Telehealth consent saved successfully. Complete:', document.complete, 'Result:', result);

    return NextResponse.json({
      success: true,
      message: 'Telehealth consent saved successfully',
      data: document,
    });

  } catch (error) {
    console.error('❌ Error saving telehealth consent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save telehealth consent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

