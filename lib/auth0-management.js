import { ManagementClient } from 'auth0';

const ALLOWED_ROLE_NAMES = ['Patient', 'Doctor', 'Admin'];

/**
 * Auth0 Management API client (M2M).
 * Ensure the M2M application is granted: read:users, update:users, read:roles
 * (and role-member permissions if Auth0 requires them separately).
 */
export function getManagementClient() {
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
    // Auth0 v5 primarily uses M2M app grants; scope kept for older tooling.
    scope: 'read:users update:users read:roles',
  });
}

export function getAllowedRoleNames() {
  return [...ALLOWED_ROLE_NAMES];
}

function pageData(page) {
  if (!page) return [];
  if (Array.isArray(page)) return page;
  if (Array.isArray(page.data)) return page.data;
  if (Array.isArray(page.roles)) return page.roles;
  return [];
}

/** List all Auth0 RBAC roles (paginated). */
export async function listAllRoles(management) {
  const roles = [];
  let page = await management.roles.list({ per_page: 100 });
  roles.push(...pageData(page));
  while (page?.hasNextPage?.()) {
    page = await page.getNextPage();
    roles.push(...pageData(page));
  }
  return roles;
}

/** Roles currently assigned to a user. */
export async function getUserRoles(management, userId) {
  const id = decodeURIComponent(userId);
  let page = await management.users.roles.list(id, { per_page: 50 });
  const roles = [...pageData(page)];
  while (page?.hasNextPage?.()) {
    page = await page.getNextPage();
    roles.push(...pageData(page));
  }
  return roles;
}

/**
 * Replace the user's Patient/Doctor/Admin role with `roleName`.
 * Leaves any other custom Auth0 roles untouched.
 */
export async function setUserPrimaryRole(management, userId, roleName) {
  const normalized = String(roleName || '').trim();
  const match = ALLOWED_ROLE_NAMES.find(
    (r) => r.toLowerCase() === normalized.toLowerCase(),
  );
  if (!match) {
    const err = new Error(`Invalid role. Allowed: ${ALLOWED_ROLE_NAMES.join(', ')}`);
    err.status = 400;
    throw err;
  }

  const id = decodeURIComponent(userId);
  const [allRoles, currentRoles] = await Promise.all([
    listAllRoles(management),
    getUserRoles(management, id),
  ]);

  const target = allRoles.find((r) => r.name?.toLowerCase() === match.toLowerCase());
  if (!target?.id) {
    const err = new Error(
      `Auth0 role "${match}" was not found. Create it in Auth0 Dashboard → User Management → Roles.`,
    );
    err.status = 404;
    throw err;
  }

  const removable = currentRoles.filter((r) =>
    ALLOWED_ROLE_NAMES.some((n) => n.toLowerCase() === String(r.name || '').toLowerCase()),
  );
  const removableIds = removable.map((r) => r.id).filter(Boolean);

  if (removableIds.length > 0) {
    await management.users.roles.delete(id, { roles: removableIds });
  }

  const alreadyHas = currentRoles.some(
    (r) => r.id === target.id || r.name?.toLowerCase() === match.toLowerCase(),
  );
  if (!alreadyHas || removableIds.includes(target.id)) {
    await management.users.roles.assign(id, { roles: [target.id] });
  }

  return getUserRoles(management, id);
}
