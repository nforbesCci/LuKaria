import { NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';

async function getManagementClient() {
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

async function requireAdmin(request) {
  const session = await getApiSession(request);
  if (!session?.user) {
    return {
      error: NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 }),
    };
  }
  if (!hasAdminOrDoctorRole(session.user)) {
    return {
      error: NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 }),
    };
  }
  return { session };
}

export async function GET(request, context) {
  console.log('🔍 API Route Called: GET /api/admin/users/[userId]');

  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const params = await context.params;
    const userId = params?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const management = await getManagementClient();
    const user = await management.users.get({ id: decodeURIComponent(userId) });

    return NextResponse.json({ success: true, user: user.data || user });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user', details: error.message },
      { status: 500 },
    );
  }
}

export async function PATCH(request, context) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const params = await context.params;
    const userId = params?.userId;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updates = await request.json();
    if (!updates) {
      return NextResponse.json({ success: false, error: 'Updates are required' }, { status: 400 });
    }

    const management = await getManagementClient();
    const updatedUser = await management.users.update(
      { id: decodeURIComponent(userId) },
      updates,
    );

    return NextResponse.json({ success: true, user: updatedUser.data || updatedUser });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user', details: error.message },
      { status: 500 },
    );
  }
}
