import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;

    console.log('📖 Fetching side effects for user:', userId);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const sideEffectsCollection = db.collection('SideEffects');

    // Fetch all side effects reports for this user, sorted by most recent
    const sideEffects = await sideEffectsCollection
      .find({ 
        userId: userId,
        reviewed: { $ne: true } 
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('✅ Side effects fetched successfully, count:', sideEffects.length);

    return NextResponse.json({
      success: true,
      sideEffects: sideEffects,
      count: sideEffects.length
    });

  } catch (error) {
    console.error('❌ Error fetching side effects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch side effects',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

