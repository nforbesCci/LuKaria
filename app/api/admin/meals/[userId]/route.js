import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Get admin user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Check if user has admin role (case insensitive)
    const userRoles = session.user['https://lukariagroup.com/roles'] || [];
    const hasAdminRole = userRoles.some(role => 
      role.toLowerCase() === 'admin' || role.toLowerCase() === 'doctor'
    );
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const targetUserId = params.userId;
    
    // Get date range from query params
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const daysBack = parseInt(searchParams.get('daysBack')) || 28;

    // Calculate date range - use provided dates or fallback to daysBack
    let startDate, endDate;
    if (startDateStr && endDateStr) {
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
    }
    
    const finalStartDateStr = startDate.toISOString().split('T')[0];
    const finalEndDateStr = endDate.toISOString().split('T')[0];

    console.log('📖 Admin fetching meals for user:', targetUserId, 'from', finalStartDateStr, 'to', finalEndDateStr);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const mealsCollection = db.collection('meals');

    // Fetch meals within date range for the target user
    const mealsDocs = await mealsCollection
      .find({ 
        userId: targetUserId,
        date: { 
          $gte: finalStartDateStr,
          $lte: finalEndDateStr
        }
      })
      .sort({ date: -1 })
      .toArray();

    // Transform to object keyed by date
    const mealsObject = {};
    mealsDocs.forEach(doc => {
      console.log('📋 Meal document structure:', {
        date: doc.date,
        hasMeals: !!doc.meals,
        mealsType: typeof doc.meals,
        mealsKeys: doc.meals ? Object.keys(doc.meals) : 'no meals',
        mealsSample: doc.meals ? JSON.stringify(doc.meals, null, 2) : 'no meals'
      });
      
      // Transform meals array to object structure expected by frontend
      if (doc.meals && Array.isArray(doc.meals)) {
        const transformedMeals = {
          breakfast: { name: 'No data', calories: 0, quantity: 1 },
          lunch: { name: 'No data', calories: 0, quantity: 1 },
          dinner: { name: 'No data', calories: 0, quantity: 1 },
          snacks: { name: 'No data', calories: 0, quantity: 1 }
        };
        
        // Process each meal in the array
        doc.meals.forEach(meal => {
          if (meal.mealType && meal.name && meal.calories !== undefined) {
            transformedMeals[meal.mealType] = {
              name: meal.name,
              calories: meal.calories,
              quantity: meal.quantity || 1
            };
          }
        });
        
        mealsObject[doc.date] = transformedMeals;
        console.log('🔄 Transformed meals for', doc.date, ':', transformedMeals);
      } else {
        mealsObject[doc.date] = doc.meals;
      }
    });

    console.log('✅ Admin meals fetched successfully, dates:', Object.keys(mealsObject).length);
    console.log('📊 Final meals object structure:', JSON.stringify(mealsObject, null, 2));

    return NextResponse.json({
      success: true,
      meals: mealsObject,
      userId: targetUserId,
      dateRange: {
        start: finalStartDateStr,
        end: finalEndDateStr,
        daysBack: daysBack
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin meals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch meals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
