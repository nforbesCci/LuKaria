import { NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../lib/api-auth';

async function getManagementClient() {
  console.log('🔧 Initializing Auth0 Management Client...');

  const domain = process.env.AUTH0_MANAGEMENT_ISSUER_BASE_URL;
  const clientId = process.env.MANAGEMENT_AUTH0_CLIENT_ID;
  const clientSecret = process.env.MANAGEMENT_AUTH0_CLIENT_SECRET;

  if (!domain) throw new Error('AUTH0_MANAGEMENT_ISSUER_BASE_URL is not set');
  if (!clientId) throw new Error('MANAGEMENT_AUTH0_CLIENT_ID is not set');
  if (!clientSecret) throw new Error('MANAGEMENT_AUTH0_CLIENT_SECRET is not set');

  const cleanDomain = domain.replace(/^https?:\/\//, '');

  return new ManagementClient({
    domain: cleanDomain,
    clientId,
    clientSecret,
    scope: 'read:users update:users',
  });
}

function requireAdmin(session) {
  if (!session?.user) {
    return NextResponse.json(
      { success: false, error: 'Not authenticated', users: [], total: 0 },
      { status: 401 },
    );
  }
  if (!hasAdminOrDoctorRole(session.user)) {
    return NextResponse.json(
      { success: false, error: 'Not authorized', users: [], total: 0 },
      { status: 403 },
    );
  }
  return null;
}

export async function GET(request) {
  console.log('🔍 API Route Called: GET /api/admin/users');

  try {
    const session = await getApiSession(request);
    const denied = requireAdmin(session);
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page'), 10) || 0;
    const perPage = parseInt(searchParams.get('per_page'), 10) || 20;
    const sort = searchParams.get('sort') || 'created_at';
    const direction = searchParams.get('direction') || '1';

    console.log('📋 Query params:', { search, page, perPage, sort });

    const management = await getManagementClient();

    const params = {
      page,
      per_page: perPage,
      sort: `${sort}:${direction}`,
      include_totals: true,
    };

    if (search.length >= 3) {
      params.q = `email:${search} OR name:*${search}* OR nickname:*${search}*`;
    }

    console.log('📞 Calling Auth0 Management API with params:', params);

    if (!management.users || typeof management.users.list !== 'function') {
      throw new Error('management.users.list is not available');
    }

    const users = await management.users.list(params);
    const calculatedStart = perPage * page;
    const auth0Start = users.response?.start;

    const responseData = {
      success: true,
      users: users.data || [],
      total: users.response?.total ?? users.total ?? 0,
      start: auth0Start !== undefined ? auth0Start : calculatedStart,
      limit: users.response?.limit ?? perPage,
      length: users.response?.length ?? (users.data?.length || 0),
    };

    console.log('📤 Sending response to frontend:', {
      usersCount: responseData.users?.length,
      total: responseData.total,
      start: responseData.start,
      page,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users from Auth0',
        details: error.message,
        users: [],
        total: 0,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await getApiSession(request);
    const denied = requireAdmin(session);
    if (denied) return denied;

    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { success: false, error: 'User ID and updates are required' },
        { status: 400 },
      );
    }

    const management = await getManagementClient();
    // Auth0 Management SDK v5: users.update(id: string, body)
    const updatedUser = await management.users.update(userId, updates);

    return NextResponse.json({ success: true, user: updatedUser.data || updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user', details: error.message },
      { status: 500 },
    );
  }
}
