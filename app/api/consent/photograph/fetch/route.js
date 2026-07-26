import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { getApiSession } from '../../../../../lib/api-auth';

export async function GET(request) {
  try {
    // Get user session
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const collection = db.collection('PhotographConsentCollection');

    // Fetch the document for this user
    let document = await collection.findOne({ userId });

    if (!document) {
      console.log('📭 No photograph consent found for user:', userId);
      
      // Create a new document for this user
      const newDocument = {
        userId: userId,
        complete: false,
        available: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert the new document
      await collection.insertOne(newDocument);
      
      return NextResponse.json({
        success: true,
        message: 'No photograph consent found',
        data: newDocument,
      });
    }

    console.log('✅ Photograph consent fetched successfully:', document);

    return NextResponse.json({
      success: true,
      message: 'Photograph consent fetched successfully',
      data: document,
    });

  } catch (error) {
    console.error('❌ Error fetching photograph consent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch photograph consent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

