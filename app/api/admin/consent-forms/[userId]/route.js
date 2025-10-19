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
    console.log('📋 Admin fetching consent forms for user:', targetUserId);

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const consentCollection = db.collection('consent');

    // Fetch all consent forms for the target user
    const consentDocs = await consentCollection
      .find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('✅ Admin consent forms fetched successfully, count:', consentDocs.length);

    return NextResponse.json({
      success: true,
      consentForms: consentDocs,
      userId: targetUserId
    });

  } catch (error) {
    console.error('❌ Error fetching admin consent forms:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch consent forms',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const { formType, enabled, locked } = await request.json();

    if (!formType) {
      return NextResponse.json(
        { error: 'Form type is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Admin updating consent form:', { targetUserId, formType, enabled, locked });

    // Connect to MongoDB
    const db = await getDatabase('lukaria');
    const consentCollection = db.collection('consent');

    // Update the consent form
    const updateData = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (locked !== undefined) updateData.locked = locked;
    updateData.updatedAt = new Date();

    const result = await consentCollection.updateOne(
      { 
        userId: targetUserId,
        formType: formType
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Consent form not found' },
        { status: 404 }
      );
    }

    console.log('✅ Admin consent form updated successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Consent form updated successfully',
      formType,
      enabled,
      locked
    });

  } catch (error) {
    console.error('❌ Error updating admin consent form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update consent form',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
