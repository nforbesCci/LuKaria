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
    const collection = db.collection('MounjaroConsentCollection');

    // Fetch the document for this user
    let document = await collection.findOne({ userId });

    if (!document) {
      console.log('📭 No mounjaro consent found for user:', userId);
      
      // Create a new document for this user
      const newDocument = {
        userId: userId,
        complete: false,
        available: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert the new document
      await collection.insertOne(newDocument);
      
      return NextResponse.json({
        success: true,
        message: 'No mounjaro consent found',
        data: newDocument,
      });
    }

    console.log('✅ Mounjaro consent fetched successfully:', document);

    return NextResponse.json({
      success: true,
      message: 'Mounjaro consent fetched successfully',
      data: document,
    });

  } catch (error) {
    console.error('❌ Error fetching mounjaro consent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch mounjaro consent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

