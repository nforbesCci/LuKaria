import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';

// Test Auth0 connection
const testAuth0Connection = async (management) => {
  try {
    console.log('🧪 Testing Auth0 connection...');
    
    // First, let's check what methods are available
    console.log('🔍 Available methods on management:', Object.keys(management));
    console.log('🔍 Available methods on management.users:', management.users ? Object.keys(management.users) : 'users is undefined');
    
    // Try different methods to test connection
    let testResult;
    if (management.users && typeof management.users.list === 'function') {
      console.log('🔄 Using management.users.list...');
      testResult = await management.users.list({ per_page: 1 });
    } else {
      throw new Error('management.users.list is not available');
    }
    
    console.log('✅ Auth0 connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Auth0 connection test failed:', error.message);
    console.error('❌ Connection test error details:', {
      name: error.name,
      status: error.status,
      statusCode: error.statusCode,
      error: error.error,
      error_description: error.error_description
    });
    return false;
  }
};

// Initialize Auth0 Management API client
const getManagementClient = async () => {
  console.log('🔧 Initializing Auth0 Management Client...');
  
  // Validate environment variables
  const domain = process.env.AUTH0_MANAGEMENT_ISSUER_BASE_URL;
  const clientId = process.env.MANAGEMENT_AUTH0_CLIENT_ID;
  const clientSecret = process.env.MANAGEMENT_AUTH0_CLIENT_SECRET;
  
  console.log('Domain:', domain);
  console.log('Client ID:', clientId);
  console.log('Client Secret:', clientSecret ? '***' : 'NOT SET');
  
  // Check for missing environment variables
  if (!domain) {
    throw new Error('AUTH0_MANAGEMENT_ISSUER_BASE_URL is not set');
  }
  if (!clientId) {
    throw new Error('MANAGEMENT_AUTH0_CLIENT_ID is not set');
  }
  if (!clientSecret) {
    throw new Error('MANAGEMENT_AUTH0_CLIENT_SECRET is not set');
  }
  
  // Clean domain (remove https:// if present)
  const cleanDomain = domain.replace(/^https?:\/\//, '');
  console.log('Clean domain:', cleanDomain);
  
  try {
    const management = new ManagementClient({
      domain: cleanDomain,
      clientId: clientId,
      clientSecret: clientSecret,
      scope: 'read:users',
    });
    

    console.log('✅ Management client created successfully');
    return management;
  } catch (error) {
    console.error('❌ Failed to create Management client:', error);
    throw error;
  }
};

export const GET = withApiAuthRequired(async (req) => {
  console.log('🔍 API Route Called: GET /api/admin/users');
  
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 0;
    const perPage = parseInt(searchParams.get('per_page')) || 20;
    const sort = searchParams.get('sort') || 'created_at';
    const direction = searchParams.get('direction') || '1';

    console.log('📋 Query params:', { search, page, perPage, sort });
    console.log('🔧 Getting Auth0 Management Client...');

    
    const management = await getManagementClient();
    console.log('✅ Management client obtained');
    console.log('🔍 Available methods on management:', Object.keys(management));
    console.log('🔍 Available methods on management.users:', management.users ? Object.keys(management.users) : 'users is undefined');
    
    // Test the connection before proceeding
    const connectionTest = await testAuth0Connection(management);
    if (!connectionTest) {
      throw new Error('Auth0 connection test failed - check your credentials and domain');
    }

    // Build query parameters
    const params = {
      page,
      per_page: perPage,
      sort: `${sort}:${direction}`,
      include_totals: true,
    };

    // Add search query if provided
    if (search.length >= 3) {
      params.q = `email:${search} OR name:*${search}* OR nickname:*${search}*`;
    }

    console.log('📞 Calling Auth0 Management API with params:', params);
   
    // Try different method names based on Auth0 SDK version
    let users;
    
    // Check what methods are available first
    console.log('🔍 Available methods on management.users:', management.users ? Object.keys(management.users) : 'users is undefined');
    
    try {
      // Use the correct method for Auth0 Management API v5.0.0
      if (management.users && typeof management.users.list === 'function') {
        console.log('🔄 Using management.users.list...');
        users = await management.users.list(params);
        console.log('✅ list succeeded');
      } else {
        throw new Error('management.users.list is not available');
      }
    } catch (methodError) {
      console.log('⚠️ management.users.list failed:', methodError.message);
      console.log('⚠️ Error details:', {
        name: methodError.name,
        status: methodError.status,
        statusCode: methodError.statusCode,
        error: methodError.error,
        error_description: methodError.error_description
      });
      throw methodError;
    }
    
    console.log('✅ Auth0 API response received:', { 
      total: users.total, 
      length: users.length,
      dataLength: users.data?.length,
      responseStart: users.response?.start,
      page: page,
      perPage: perPage
    });

    const calculatedStart = perPage * page;
    const auth0Start = users.response?.start;
    
    console.log('🔢 Start calculation:', {
      calculatedStart,
      auth0Start,
      willUse: auth0Start !== undefined ? auth0Start : calculatedStart
    });

    const responseData = {
      users: users.data,
      total: users.response.total,
      start: auth0Start !== undefined ? auth0Start : calculatedStart,
      limit: users.response.limit,
      length: users.response.length,
    };
    
    console.log('📤 Sending response to frontend:', {
      usersCount: responseData.users?.length,
      total: responseData.total,
      start: responseData.start,
      limit: responseData.limit,
      page: page
    });
    
    return Response.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Return proper error response instead of mock data
    return Response.json(
      { 
        error: 'Failed to fetch users from Auth0', 
        details: error.message,
        users: [],
        total: 0
      },
      { status: 500 }
    );
  }
});

export const PATCH = withApiAuthRequired(async (req) => {
  debugger; // Debug point for PATCH method
  try {
    const { userId, updates } = await req.json();

    if (!userId || !updates) {
      return Response.json(
        { error: 'User ID and updates are required' },
        { status: 400 }
      );
    }

    const management = await getManagementClient();
    
    const updatedUser = await management.users.update(
      { id: userId },
      updates
    );

    return Response.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
});

