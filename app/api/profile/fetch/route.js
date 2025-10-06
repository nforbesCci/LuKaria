import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../lib/mongodb';

export async function GET(request) {
  try {
    console.log('🔄 Profile Fetch API: Starting profile fetch...');
    
    // Get the user session
    const session = await getSession(request);
    if (!session || !session.user) {
      console.log('❌ Profile Fetch API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Profile Fetch API: User ID:', userId);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Profile Fetch API: Connected to MongoDB');

    // Find the profile for this user
    const profile = await db.collection('profiles').findOne({ userId: userId });
    console.log('🔍 Profile Fetch API: Profile found:', !!profile);

    if (!profile) {
      console.log('📝 Profile Fetch API: No profile found for user');
      return NextResponse.json({
        success: true,
        message: 'No profile found',
        profile: null,
        exists: false,
      });
    }

    console.log('✅ Profile Fetch API: Profile fetched successfully', {
      userId: profile.userId,
      name: profile.name,
      email: profile.userEmail,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile fetched successfully',
      profile: profile,
      exists: true,
    });

  } catch (error) {
    console.error('❌ Profile Fetch API: Error fetching profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
