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
    const payload = await request.json();
    const date = payload.date;
    let meals = payload.meals;

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Accept either a flat array or a map of slot → items[]
    if (meals && !Array.isArray(meals) && typeof meals === 'object') {
      meals = Object.entries(meals).flatMap(([mealType, items]) =>
        (Array.isArray(items) ? items : []).map((item) => ({
          ...item,
          mealType: item.mealType || mealType,
        })),
      );
    }

    if (!meals || !Array.isArray(meals)) {
      return NextResponse.json(
        { error: 'Meals array is required' },
        { status: 400 }
      );
    }

    // Enforce at most one photo and reasonable slot set
    const slots = new Set();
    for (const item of meals) {
      const slot = item.mealType || 'lunch';
      slots.add(slot);
    }
    if (slots.size > 6) {
      return NextResponse.json(
        { error: 'At most 6 meal slots are allowed per day' },
        { status: 400 },
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

