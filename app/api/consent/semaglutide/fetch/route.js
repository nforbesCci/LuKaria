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
    const collection = db.collection('SemaglutideConsentCollection');

    // Fetch the document for this user
    let document = await collection.findOne({ userId });

    if (!document) {
      console.log('📭 No semaglutide consent found for user:', userId);
      
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
        message: 'No semaglutide consent found',
        data: newDocument,
      });
    }

    console.log('✅ Semaglutide consent fetched successfully:', document);

    return NextResponse.json({
      success: true,
      message: 'Semaglutide consent fetched successfully',
      data: document,
    });

  } catch (error) {
    console.error('❌ Error fetching semaglutide consent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch semaglutide consent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
