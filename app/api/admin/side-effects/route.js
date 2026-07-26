import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    console.log('🔍 API: Fetching all side effects for admin');
    
    // Get user session
    const session = await getApiSession(request);
    
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
      console.error('❌ API: User is not authorized to view all side effects');
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
    
    // Find all completed side effects reports
    const query = { 
      complete: true,
      reviewed: { $ne: true }
    };
    
    console.log('🔍 API: Query:', query);

    // Get total count for pagination
    const totalCount = await db.collection('SideEffects').countDocuments(query);
    console.log('📊 API: Total side effects reports:', totalCount);

    // Get paginated results with user information
    const sideEffectsReports = await db.collection('SideEffects')
      .find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .toArray();

    console.log('📋 API: Found side effects reports:', sideEffectsReports.length);

    // Get user information for each report
    const reportsWithUserInfo = await Promise.all(
      sideEffectsReports.map(async (report) => {
        try {
          // Get user profile information
          const userProfile = await db.collection('profiles').findOne({ userId: report.userId });
          
          return {
            ...report,
            userInfo: {
              name: userProfile?.name || 'Unknown',
              email: userProfile?.email || 'No email',
              phone: userProfile?.preferredPhone || 'No phone',
              dateOfBirth: userProfile?.dateOfBirth || 'No DOB',
              parish: userProfile?.parish || 'No parish'
            }
          };
        } catch (error) {
          console.error('Error fetching user info for report:', report._id, error);
          return {
            ...report,
            userInfo: {
              name: 'Unknown',
              email: 'No email',
              phone: 'No phone',
              dateOfBirth: 'No DOB',
              parish: 'No parish'
            }
          };
        }
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const response = {
      success: true,
      data: {
        reports: reportsWithUserInfo,
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

    console.log('✅ API: Returning side effects reports with pagination');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API: Error fetching side effects reports:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch side effects reports' },
      { status: 500 }
    );
  }
}

