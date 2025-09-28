import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';

// Initialize Auth0 Management API client
const getManagementClient = async () => {
  const { accessToken } = await getAccessToken();
  
  return new ManagementClient({
    domain: process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '') || process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    scope: 'read:users read:user_idp_tokens',
    token: accessToken,
  });
};

export const GET = withApiAuthRequired(async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page')) || 0;
    const perPage = parseInt(searchParams.get('per_page')) || 20;
    const sort = searchParams.get('sort') || 'created_at:1';

    const management = await getManagementClient();

    // Build query parameters
    const params = {
      page,
      per_page: perPage,
      sort,
      include_totals: true,
    };

    // Add search query if provided
    if (search) {
      params.q = `email:*${search}* OR name:*${search}* OR nickname:*${search}*`;
    }

    const users = await management.users.getAll(params);

    return Response.json({
      users: users.data,
      total: users.total,
      start: users.start,
      limit: users.limit,
      length: users.length,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
});

export const PATCH = withApiAuthRequired(async (req) => {
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

