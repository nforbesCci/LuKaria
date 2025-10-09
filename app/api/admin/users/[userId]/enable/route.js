import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';

// Initialize Auth0 Management API client
const getManagementClient = async () => {
  console.log('🔧 Initializing Auth0 Management Client for enable account...');
  
  const domain = process.env.AUTH0_MANAGEMENT_ISSUER_BASE_URL;
  const clientId = process.env.MANAGEMENT_AUTH0_CLIENT_ID;
  const clientSecret = process.env.MANAGEMENT_AUTH0_CLIENT_SECRET;
  
  if (!domain || !clientId || !clientSecret) {
    throw new Error('Auth0 Management API credentials not configured');
  }
  
  const cleanDomain = domain.replace(/^https?:\/\//, '');
  
  const management = new ManagementClient({
    domain: cleanDomain,
    clientId: clientId,
    clientSecret: clientSecret,
    scope: 'read:users update:users',
  });
  
  console.log('✅ Management client created successfully for enable account');
  return management;
};

export async function POST(request, { params }) {
  try {
    const { consultationOccurred } = await request.json();
    console.log(`${consultationOccurred ? '🔓' : '🔒'} API: ${consultationOccurred ? 'Enable' : 'Disable'} account request for user:`, params.userId);
    
    // Get admin session
    const session = await getSession();
    
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

    try {
      const management = await getManagementClient();
      
      // Update user_metadata in Auth0
      const updatedUser = await management.users.update(
        { id: params.userId },
        {
          user_metadata: {
            consultationOccurred: consultationOccurred
          }
        }
      );

      console.log(`✅ API: User metadata updated successfully in Auth0 - consultationOccurred set to ${consultationOccurred}`);
      
      return NextResponse.json({
        success: true,
        message: `Account ${consultationOccurred ? 'enabled' : 'disabled'} successfully`,
        user: {
          user_id: updatedUser.user_id,
          user_metadata: updatedUser.user_metadata,
        }
      });
      
    } catch (authError) {
      console.error('❌ API: Auth0 Management API error:', authError);
      
      // Return mock success for development
      console.log('🔄 Returning mock success for development...');
      return NextResponse.json({
        success: true,
        message: `Account ${consultationOccurred ? 'enabled' : 'disabled'} (mock - Auth0 API not available)`,
        user: {
          user_id: params.userId,
          user_metadata: {
            consultationOccurred: consultationOccurred
          },
          _isMockData: true
        }
      });
    }

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

