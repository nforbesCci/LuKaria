import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../../../lib/api-auth';
import { getDatabase } from '../../../../../../lib/mongodb';

export async function POST(request, { params }) {
  try {
    const { consultationOccurred } = await request.json();
    console.log(`${consultationOccurred ? '🔓' : '🔒'} API: ${consultationOccurred ? 'Enable' : 'Disable'} account request for user:`, params.userId);
    
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
      console.error('❌ API: User is not authorized to modify accounts');
      return NextResponse.json(
        { success: false, error: 'Not authorized' },
        { status: 403 }
      );
    }
    
    console.log('📋 API: Updating consultationOccurred to:', consultationOccurred);

    // Save to MongoDB
    const db = await getDatabase();
    console.log('💾 API: Saving consultationOccurred to MongoDB...');
    
    const result = await db.collection('profiles').updateOne(
      { userId: params.userId },
      { 
        $set: { 
          'user_metadata.consultationOccurred': consultationOccurred,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('✅ API: consultationOccurred saved to MongoDB:', result);

    const mounjaroConsentCollection      = db.collection('MounjaroConsentCollection');

    let mounjaroConsentDocs = await mounjaroConsentCollection
    .findOne({ userId: params.userId });

  if(mounjaroConsentDocs == null){
    mounjaroConsentDocs = {
      userId: params.userId,
      complete: false,
      available: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await mounjaroConsentCollection.insertOne(mounjaroConsentDocs);
  } else{
      mounjaroConsentDocs.available = consultationOccurred;
      await mounjaroConsentCollection.updateOne(
        { userId: params.userId },
        { $set: { available: true } }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Account ${consultationOccurred ? 'enabled' : 'disabled'} successfully`,
      user: {
        user_id: params.userId,
        user_metadata: {
          consultationOccurred: consultationOccurred
        }
      }
    });

  } catch (error) {
    console.error('❌ API: Error enabling account:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to enable account' 
      },
      { status: 500 }
    );
  }
}

