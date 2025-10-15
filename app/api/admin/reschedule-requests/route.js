import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    console.log('🔍 API: Fetching reschedule requests');
    
    // Get user session
    const session = await getSession();
    
    if (!session || !session.user) {
      console.error('❌ API: User not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check admin/doctor permissions
    const adminGroups = session.user.groups || session.user['https://lukariagroup.com/roles'] || [];
    const isAdmin = adminGroups.includes('Admin') || adminGroups.includes('Doctor');
    
    console.log('🔐 API: Admin groups:', adminGroups);
    console.log('🔐 API: Is admin:', isAdmin);
    
    if (!isAdmin) {
      console.error('❌ API: User is not authorized to view reschedule requests');
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    console.log('📄 API: Pagination params - page:', page, 'limit:', limit, 'skip:', skip);

    // Get database connection
    const db = await getDatabase();
    
    // Find appointments with reschedule requests
    const query = { 
      rescheduleRequested: true 
    };
    
    console.log('🔍 API: Query:', query);

    // Get total count for pagination
    const totalCount = await db.collection('appointments').countDocuments(query);
    console.log('📊 API: Total reschedule requests:', totalCount);

    // Get paginated results
    const rescheduleRequests = await db.collection('appointments')
      .find(query)
      .sort({ rescheduleRequestedAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log('📋 API: Found reschedule requests:', rescheduleRequests.length);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      success: true,
      data: {
        requests: rescheduleRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    };

    console.log('✅ API: Returning reschedule requests with pagination');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API: Error fetching reschedule requests:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reschedule requests' },
      { status: 500 }
    );
  }
}

