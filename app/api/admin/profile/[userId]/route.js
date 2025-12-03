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
    console.log('📋 Admin fetching profile for user:', targetUserId);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const profilesCollection = db.collection('profiles');
    const appointmentsCollection = db.collection('appointments');
    // Fetch profile for the target user
    const profile = await profilesCollection.findOne({ userId: targetUserId });

    if (!profile) {
      return NextResponse.json({
        success: true,
        profile: null,
        userId: targetUserId,
        message: 'No profile found for this user'
      });
    }

    const schedule = await appointmentsCollection.findOne({ userId: targetUserId });


    return NextResponse.json({
      success: true,
      profile,
      schedule,
      userId: targetUserId,     
    });

  } catch (error) {
    console.error('❌ Error fetching admin profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
