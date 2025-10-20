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
    
    // Get date range from query params (default to last 4 weeks)
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const daysBack = parseInt(searchParams.get('daysBack')) || 28;

    // Calculate date range - use provided dates or fallback to daysBack
    let startDateObj, endDateObj;
    if (startDate && endDate) {
      startDateObj = new Date(startDate);
      endDateObj = new Date(endDate);
    } else {
      endDateObj = new Date();
      startDateObj = new Date();
      startDateObj.setDate(startDateObj.getDate() - daysBack);
    }
    
    const startDateStr = startDateObj.toISOString().split('T')[0];
    const endDateStr = endDateObj.toISOString().split('T')[0];

    console.log('📊 Admin fetching measurements for user:', targetUserId, 'from', startDateStr, 'to', endDateStr);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const measurementsCollection = db.collection('measurements');

    // Fetch measurements within date range for the target user
    const measurements = await measurementsCollection
      .find({ 
        userId: targetUserId,
        dateKey: { 
          $gte: startDateStr,
          $lte: endDateStr
        }
      })
      .sort({ dateKey: -1 })
      .toArray();

    console.log('✅ Admin measurements fetched successfully, count:', measurements.length);

    return NextResponse.json({
      success: true,
      measurements,
      userId: targetUserId,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
        daysBack: daysBack
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin measurements:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch measurements',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
