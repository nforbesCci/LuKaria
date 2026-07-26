import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../../lib/api-auth';
import { getDatabase } from '../../../../../../lib/mongodb';

export async function GET(request, { params }) {
  try {
    console.log('🔍 API: Fetching DB profile for user:', params.userId);
    
    // Get admin session
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      console.error('❌ API: Admin not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if admin has proper role
    const adminGroups = session.user.groups || session.user['https://lukariagroup.com/roles'] || [];
    const isAdmin = adminGroups.includes('Admin') || adminGroups.includes('Doctor');
    
    if (!isAdmin) {
      console.error('❌ API: User is not authorized to view profiles');
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 API: Connected to MongoDB');

    // Find the profile for this user
    const profile = await db.collection('profiles').findOne({ userId: params.userId });
    console.log('🔍 API: Profile found:', !!profile);

    if (!profile) {
      console.log('📝 API: No profile found for user');
      return NextResponse.json({
        success: true,
        message: 'No profile found',
        profile: null,
        exists: false,
      });
    }

    console.log('✅ API: Profile fetched successfully from DB', {
      userId: profile.userId,
      hasUserMetadata: !!profile.user_metadata,
      consultationOccurred: profile.user_metadata?.consultationOccurred,
    });
    
    console.log('📋 API: Full profile data:', JSON.stringify(profile, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Profile fetched successfully',
      profile: profile,
      exists: true,
    });

  } catch (error) {
    console.error('❌ API: Error fetching profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch profile' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    console.log('💾 API: Admin updating profile for user:', params.userId);
    
    // Get admin session
    const session = await getApiSession(request);
    
    if (!session || !session.user) {
      console.error('❌ API: Admin not authenticated');
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if admin has proper role
    const adminGroups = session.user.groups || session.user['https://lukariagroup.com/roles'] || [];
    const isAdmin = adminGroups.includes('Admin') || adminGroups.includes('Doctor');
    
    if (!isAdmin) {
      console.error('❌ API: User is not authorized to update profiles');
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('📥 API: Profile update data received:', body);

    // Connect to MongoDB
    const db = await getDatabase();
    
    // Update user profile
    const result = await db.collection('profiles').updateOne(
      { userId: params.userId },
      { 
        $set: { 
          ...body,
          updatedAt: new Date(),
          updatedBy: session.user.sub
        }
      },
      { upsert: true }
    );

    console.log('✅ API: Profile updated successfully:', {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount
      },
    });

  } catch (error) {
    console.error('❌ API: Error updating profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      },
      { status: 500 }
    );
  }
}


