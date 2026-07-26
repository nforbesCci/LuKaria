import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { getDatabase } from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    console.log('🔄 Profile API: Starting profile save...');
    
    // Get the user session
    const session = await getApiSession(request);
    if (!session || !session.user) {
      console.log('❌ Profile API: No user session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log('👤 Profile API: User ID:', userId);

    // Get the profile data from the request body
    const profileData = await request.json();
    console.log('📝 Profile API: Profile data received:', profileData);

    // Connect to MongoDB
    const db = await getDatabase();
    console.log('🔗 Profile API: Connected to MongoDB');

    // Prepare the profile document for update
    const profileUpdateData = {
      userId: userId,
      userEmail: session.user.email,
      ...profileData,
      updatedAt: new Date(),
    };

    console.log('📝 Profile API: Update data prepared:', profileUpdateData);

    // Check if profile already exists
    const existingProfile = await db.collection('profiles').findOne({ userId: userId });
    console.log('🔍 Profile API: Existing profile found:', !!existingProfile);

    let result;
    if (existingProfile) {
      // Update existing profile
      console.log('🔄 Profile API: Updating existing profile');
      result = await db.collection('profiles').updateOne(
        { userId: userId },
        { $set: profileUpdateData }
      );
    } else {
      // Insert new profile
      console.log('➕ Profile API: Creating new profile');
      const newProfileData = {
        ...profileUpdateData,
        createdAt: new Date(),
      };
      result = await db.collection('profiles').insertOne(newProfileData);
    }

    console.log('✅ Profile API: Profile saved successfully', result);

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      profileId: result.insertedId || userId,
      operation: existingProfile ? 'updated' : 'created',
      ...(existingProfile ? {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      } : {
        insertedId: result.insertedId,
      }),
    });

  } catch (error) {
    console.error('❌ Profile API: Error saving profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
