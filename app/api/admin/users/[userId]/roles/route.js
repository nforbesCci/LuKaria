import { NextResponse } from 'next/server';
import { getApiSession, hasAdminRole } from '../../../../../../lib/api-auth';
import {
  getAllowedRoleNames,
  getManagementClient,
  getUserRoles,
  listAllRoles,
  setUserPrimaryRole,
} from '../../../../../../lib/auth0-management';

export const dynamic = 'force-dynamic';

function requireAdminOnly(session) {
  if (!session?.user) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
  }
  if (!hasAdminRole(session.user)) {
    return NextResponse.json(
      { success: false, error: 'Forbidden — Admin role required to manage user roles' },
      { status: 403 },
    );
  }
  return null;
}

function resolveUserId(raw) {
  if (!raw) return '';
  let id = String(raw);
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
  try {
    const session = await getApiSession(request);
    const denied = requireAdminOnly(session);
    if (denied) return denied;

    const params = await context.params;
    const userId = resolveUserId(params?.userId);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const management = getManagementClient();
    const [roles, available] = await Promise.all([
      getUserRoles(management, userId),
      listAllRoles(management),
    ]);

    const allowed = getAllowedRoleNames();
    const availableRoles = available
      .filter((r) => allowed.some((n) => n.toLowerCase() === String(r.name || '').toLowerCase()))
      .map((r) => ({ id: r.id, name: r.name, description: r.description }));

    const primary =
      roles.find((r) =>
        allowed.some((n) => n.toLowerCase() === String(r.name || '').toLowerCase()),
      )?.name || null;

    return NextResponse.json({
      success: true,
      userId,
      roles: roles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
      primaryRole: primary,
      availableRoles:
        availableRoles.length > 0
          ? availableRoles
          : allowed.map((name) => ({ id: null, name, description: null })),
    });
  } catch (error) {
    console.error('[Admin Roles] GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user roles',
        details: error.message,
      },
      { status: error.status || 500 },
    );
  }
}

export async function PUT(request, context) {
  try {
    const session = await getApiSession(request);
    const denied = requireAdminOnly(session);
    if (denied) return denied;

    const params = await context.params;
    const userId = resolveUserId(params?.userId);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const roleName = body?.role || body?.roles?.[0];
    if (!roleName) {
      return NextResponse.json(
        { success: false, error: 'Body must include role (Patient, Doctor, or Admin)' },
        { status: 400 },
      );
    }

    const decodedId = userId;
    if (decodedId === session.user.sub) {
      return NextResponse.json(
        { success: false, error: 'You cannot change your own role' },
        { status: 400 },
      );
    }

    const management = getManagementClient();
    const roles = await setUserPrimaryRole(management, decodedId, roleName);
    const allowed = getAllowedRoleNames();
    const primary =
      roles.find((r) =>
        allowed.some((n) => n.toLowerCase() === String(r.name || '').toLowerCase()),
      )?.name || null;

    return NextResponse.json({
      success: true,
      message: `Role updated to ${primary || roleName}`,
      roles: roles.map((r) => ({ id: r.id, name: r.name, description: r.description })),
      primaryRole: primary,
    });
  } catch (error) {
    console.error('[Admin Roles] PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update user roles',
        details: error.message,
      },
      { status: error.status || 500 },
    );
  }
}
