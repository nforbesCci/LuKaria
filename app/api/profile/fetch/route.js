import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  const requestId = Math.random().toString(36).substring(7);
  try {
    console.log(`🔄 [${requestId}] Profile Fetch API: Starting profile fetch...`);
    console.log(`📍 [${requestId}] Profile Fetch API: Request timestamp:`, new Date().toISOString());
    
    // Get the user session
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log(`❌ [${requestId}] Profile Fetch API: No user session found`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log(`👤 [${requestId}] Profile Fetch API: User ID:`, userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log(`🔗 [${requestId}] Profile Fetch API: Connected to MongoDB`);

    // Find the profile for this user
    const profile = await db.collection('profiles').findOne({ userId: userId });
    console.log(`🔍 [${requestId}] Profile Fetch API: Profile found:`, !!profile);

    if (!profile) {
      console.log(`📝 [${requestId}] Profile Fetch API: No profile found for user`);
      return NextResponse.json({
        success: true,
        message: 'No profile found',
        profile: null,
        exists: false,
      });
    }

    console.log(`✅ [${requestId}] Profile Fetch API: Profile fetched successfully`, {
      userId: profile.userId,
      name: profile.name,
      email: profile.userEmail,
      hasUserMetadata: !!profile.user_metadata,
      consultationOccurred: profile.user_metadata?.consultationOccurred,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile fetched successfully',
      profile: profile,
      exists: true,
    });

  } catch (error) {
    console.error(`❌ [${requestId}] Profile Fetch API: Error fetching profile:`, error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
