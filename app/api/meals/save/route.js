import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Get user session
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userId = session.user.sub;
    const { date, meals } = await request.json();

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    if (!meals || !Array.isArray(meals)) {
      return NextResponse.json(
        { error: 'Meals array is required' },
        { status: 400 }
      );
    }

    console.log('💾 Saving meals for user:', userId, 'date:', date);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const mealsCollection = db.collection('meals');

    // Update or insert meals for this user and date
    const result = await mealsCollection.updateOne(
      { 
        userId: userId,
        date: date
      },
      {
        $set: {
          userId: userId,
          date: date,
          meals: meals,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Meals saved successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Meals saved successfully',
      date: date,
      mealsCount: meals.length
    });

  } catch (error) {
    console.error('❌ Error saving meals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save meals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

