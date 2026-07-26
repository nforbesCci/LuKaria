import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../lib/api-auth';
import { getDatabase } from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    // Get admin user session
    const session = await getApiSession(request);
    
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

    console.log('📋 Admin fetching medications for user:', targetUserId, 'from', startDateStr, 'to', endDateStr);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const medicationsCollection = db.collection('medications');

    // Fetch medications within date range for the target user
    const medications = await medicationsCollection
      .find({ 
        userId: targetUserId,
        date: { 
          $gte: startDateStr,
          $lte: endDateStr
        }
      })
      .sort({ date: -1 })
      .toArray();

    console.log('✅ Admin medications fetched successfully, count:', medications.length);

    return NextResponse.json({
      success: true,
      medications,
      userId: targetUserId,
      dateRange: {
        start: startDateStr,
        end: endDateStr,
        daysBack: daysBack
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin medications:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch medications',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
