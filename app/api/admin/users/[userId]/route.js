import { NextResponse } from 'next/server';
import { getApiSession, hasAdminOrDoctorRole } from '../../../../../lib/api-auth';
import { getManagementClient } from '../../../../../lib/auth0-management';

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

function resolveUserId(raw) {
  if (!raw) return '';
  let id = String(raw);
  // Next may leave one level of encoding; tolerate accidental double-encoding of "|"
  try {
    while (id.includes('%')) {
      const next = decodeURIComponent(id);
      if (next === id) break;
      id = next;
    }
  } catch {
    // keep current id
  }
  return id;
}

export async function GET(request, context) {
  console.log('🔍 API Route Called: GET /api/admin/users/[userId]');

  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const params = await context.params;
    const userId = resolveUserId(params?.userId);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    // Auth0 Management SDK v5: users.get(id: string)
    const management = getManagementClient();
    const user = await management.users.get(userId);

    return NextResponse.json({ success: true, user: user.data || user });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user',
        details: error.message || error.body?.message || String(error),
      },
      { status: error.statusCode || error.status || 500 },
    );
  }
}

export async function PATCH(request, context) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) return auth.error;

    const params = await context.params;
    const userId = resolveUserId(params?.userId);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updates = await request.json();
    if (!updates) {
      return NextResponse.json({ success: false, error: 'Updates are required' }, { status: 400 });
    }

    // Auth0 Management SDK v5: users.update(id: string, body)
    const management = getManagementClient();
    const updatedUser = await management.users.update(userId, updates);

    return NextResponse.json({ success: true, user: updatedUser.data || updatedUser });
  } catch (error) {
    console.error('❌ Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        details: error.message || error.body?.message || String(error),
      },
      { status: error.statusCode || error.status || 500 },
    );
  }
}
