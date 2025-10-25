import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { getDatabase } from '../../../../../lib/mongodb';

export const dynamic = 'force-dynamic';

// Handle preflight requests
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request, { params }) {
  try {
    // Get admin user session
    const session = await getSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
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

    const telehealthCollection = db.collection('TelehealthCollection');

    // Fetch all consent forms for the target user
    const telehealthDocs = await telehealthCollection
      .findOne({ userId: targetUserId });

    const photographConsentCollection = db.collection('PhotographConsentCollection');

    // Fetch all consent forms for the target user
    const photographConsentDocs = await photographConsentCollection
      .findOne({ userId: targetUserId });

      const mounjaroConsentCollection      = db.collection('MounjaroConsentCollection');

      // Fetch all consent forms for the target user
      const mounjaroConsentDocs = await mounjaroConsentCollection
        .findOne({ userId: targetUserId });


    const consentDocs = {telehealth : telehealthDocs,
      photograph:photographConsentDocs, 
      mounjaro: mounjaroConsentDocs};

    console.log('✅ Admin consent forms fetched successfully:', {
      telehealth: telehealthDocs ? 'found' : 'not found',
      photograph: photographConsentDocs ? 'found' : 'not found', 
      mounjaro: mounjaroConsentDocs ? 'found' : 'not found'
    });

    // Debug: Log the actual properties of each form
    if (telehealthDocs) {
      console.log('📊 Telehealth form properties:', {
        available: telehealthDocs.available,
        locked: telehealthDocs.locked,
        complete: telehealthDocs.complete
      });
    }
    if (photographConsentDocs) {
      console.log('📊 Photograph form properties:', {
        available: photographConsentDocs.available,
        locked: photographConsentDocs.locked,
        complete: photographConsentDocs.complete
      });
    }
    if (mounjaroConsentDocs) {
      console.log('📊 Mounjaro form properties:', {
        available: mounjaroConsentDocs.available,
        locked: mounjaroConsentDocs.locked,
        complete: mounjaroConsentDocs.complete
      });
    }

    return NextResponse.json({
      success: true,
      consentForms: consentDocs,
      userId: targetUserId
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('❌ Error fetching admin consent forms:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch consent forms',
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
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
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
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
    const { formType, enabled, locked, complete } = await request.json();

    const db = await getDatabase('lukaria');

    if (!formType) {
      return NextResponse.json(
        { error: 'Form type is required' },
        { status: 400 }
      );
    }

    let result = null;
    
    // Build update object based on provided parameters
    const updateFields = {};
    if (enabled !== undefined) updateFields.available = enabled;
    if (locked !== undefined) updateFields.locked = locked;
    if (complete !== undefined) updateFields.complete = complete;
    
    if (formType === 'telehealth') {
      const telehealthCollection = db.collection('TelehealthCollection');
      result = await telehealthCollection.updateOne(
        { userId: targetUserId },
        { $set: updateFields }
      );
    }

    if (formType === 'photograph') {
      const photographCollection = db.collection('PhotographConsentCollection');
      result = await photographCollection.updateOne(
        { userId: targetUserId },
        { $set: updateFields }
      );
    }
    
    if (formType === 'mounjaro') {
      const mounjaroCollection = db.collection('MounjaroConsentCollection');
      result = await mounjaroCollection.updateOne(
        { userId: targetUserId },
        { $set: updateFields }
      );
    }

    console.log('🔧 Admin updating consent form:', { targetUserId, formType, enabled, locked, complete, updateFields });

    // Check if result was set (form type matched)
    if (!result) {
      return NextResponse.json(
        { error: 'Invalid form type' },
        { status: 400 }
      );
    }

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
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('❌ Error updating admin consent form:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update consent form',
        details: error.message 
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}
