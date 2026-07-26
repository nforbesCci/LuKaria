import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../lib/api-auth';
import { getDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

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
    
    // Get limit from query params (default to last 4)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 4;

    console.log('📋 Admin fetching side effects for user:', targetUserId, 'limit:', limit);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const sideEffectsCollection = db.collection('SideEffects');

    // Fetch side effects for the target user, sorted by date (newest first)
    const sideEffects = await sideEffectsCollection
      .find({ 
        userId: targetUserId
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    console.log('✅ Admin side effects fetched successfully, count:', sideEffects.length);

    return NextResponse.json({
      success: true,
      sideEffects,
      userId: targetUserId,
      limit: limit
    });

  } catch (error) {
    console.error('❌ Error fetching admin side effects:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch side effects',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const { sideEffectId, action, updates } = await request.json();

    console.log('📝 Admin updating side effect:', { targetUserId, sideEffectId, action, updates });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const sideEffectsCollection = db.collection('SideEffects');

    // Prepare update object
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Update the side effect
    const result = await sideEffectsCollection.updateOne(
      { 
        _id: new ObjectId(sideEffectId),
        userId: targetUserId
      },
      { 
        $set: updateData
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Side effect not found' },
        { status: 404 }
      );
    }

    console.log('✅ Admin side effect updated successfully:', { action, sideEffectId });

    return NextResponse.json({
      success: true,
      message: `Side effect ${action} successfully`,
      sideEffectId,
      action
    });

  } catch (error) {
    console.error('❌ Error updating admin side effect:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update side effect',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
