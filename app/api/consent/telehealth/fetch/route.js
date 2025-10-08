import { NextResponse } from 'next/server';
import clientPromise from '../../../../../lib/mongodb';
import { getSession } from '@auth0/nextjs-auth0';

export async function GET(request) {
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

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const collection = db.collection('TelehealthCollection');

    // Fetch the document for this user
    const document = await collection.findOne({ userId });

    if (!document) {
      console.log('📭 No telehealth consent found for user:', userId);
      return NextResponse.json({
        success: true,
        message: 'No telehealth consent found',
        data: null,
      });
    }

    console.log('✅ Telehealth consent fetched successfully:', document);

    return NextResponse.json({
      success: true,
      message: 'Telehealth consent fetched successfully',
      data: document,
    });

  } catch (error) {
    console.error('❌ Error fetching telehealth consent:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch telehealth consent',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

