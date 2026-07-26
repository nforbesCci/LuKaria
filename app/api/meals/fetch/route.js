import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import clientPromise from '../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
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
    
    // Get date range from query params (default to last 2 weeks)
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('daysBack')) || 14;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log('📖 Fetching meals for user:', userId, 'from', startDateStr, 'to', endDateStr);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('lukaria');
    const mealsCollection = db.collection('meals');

    // Fetch meals within date range for this user
    const mealsDocs = await mealsCollection
      .find({ 
        userId: userId,
        date: { 
          $gte: startDateStr,
          $lte: endDateStr
        }
      })
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
      meals: mealsObject,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
        daysBack: daysBack
      }
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

