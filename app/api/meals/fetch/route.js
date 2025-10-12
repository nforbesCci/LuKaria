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

    console.log('📖 Fetching meals for user:', userId);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const mealsCollection = db.collection('meals');

    // Fetch all meals for this user
    const mealsDocs = await mealsCollection
      .find({ userId: userId })
      .sort({ date: -1 })
      .toArray();

    // Transform to object keyed by date
    const mealsObject = {};
    mealsDocs.forEach(doc => {
      mealsObject[doc.date] = doc.meals;
    });

    console.log('✅ Meals fetched successfully, dates:', Object.keys(mealsObject).length);

    return NextResponse.json({
      success: true,
      meals: mealsObject
    });

  } catch (error) {
    console.error('❌ Error fetching meals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch meals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

