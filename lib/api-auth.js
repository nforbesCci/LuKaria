import { getSession } from '@auth0/nextjs-auth0';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ROLES_CLAIM = 'https://lukariagroup.com/roles';

let jwks;

function getJwks() {
  if (!jwks) {
    const issuerBase =
      process.env.AUTH0_ISSUER_BASE_URL ||
      (process.env.AUTH0_DOMAIN ? `https://${process.env.AUTH0_DOMAIN}` : null);
    if (!issuerBase) {
      throw new Error('AUTH0_ISSUER_BASE_URL or AUTH0_DOMAIN is required for JWT validation');
    }
    const normalized = issuerBase.replace(/\/$/, '');
    jwks = createRemoteJWKSet(new URL(`${normalized}/.well-known/jwks.json`));
  }
  return jwks;
}

function normalizeIssuer(issuerBase) {
  const base = (issuerBase || '').replace(/\/$/, '');
  return base.endsWith('/') ? base : `${base}/`;
}

function allowedIssuers() {
  const issuers = new Set();
  const add = (raw) => {
    if (!raw) return;
    const trimmed = String(raw).trim().replace(/\/$/, '');
    if (!trimmed) return;
    const withScheme = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    issuers.add(normalizeIssuer(withScheme));
  };
  add(process.env.AUTH0_ISSUER_BASE_URL);
  add(process.env.AUTH0_DOMAIN);
  add(process.env.AUTH0_MANAGEMENT_ISSUER_BASE_URL);
  return [...issuers];
}

function allowedAudiences() {
  return [
    process.env.AUTH0_AUDIENCE,
    process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    process.env.AUTH0_NATIVE_CLIENT_ID,
    process.env.AUTH0_CLIENT_ID,
  ].filter(Boolean);
}

/**
 * Resolve Auth0 session for API routes.
 * Supports:
 * 1. Authorization: Bearer <access_token|id_token> (native mobile)
 * 2. Existing cookie session from @auth0/nextjs-auth0 (web)
 *
 * @param {Request} [request]
 * @returns {Promise<{user: object, accessToken?: string} | null>}
 */
export async function getApiSession(request) {
  const authHeader =
    request?.headers?.get?.('authorization') ||
    request?.headers?.get?.('Authorization');

  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      try {
        const issuers = allowedIssuers();
        const audiences = allowedAudiences();
        const verifyOptions = {
          algorithms: ['RS256'],
        };
        if (issuers.length === 1) {
          verifyOptions.issuer = issuers[0];
        } else if (issuers.length > 1) {
          verifyOptions.issuer = issuers;
        } else {
          throw new Error('No Auth0 issuer configured (AUTH0_ISSUER_BASE_URL / AUTH0_DOMAIN)');
        }
        if (audiences.length === 1) {
          verifyOptions.audience = audiences[0];
        } else if (audiences.length > 1) {
          verifyOptions.audience = audiences;
        }

        const { payload } = await jwtVerify(token, getJwks(), verifyOptions);

        const roles =
          payload[ROLES_CLAIM] ||
          payload.roles ||
          payload['https://lukariagroup.com/roles'] ||
          [];

        return {
          user: {
            sub: payload.sub,
            email: payload.email || payload[`https://lukariagroup.com/email`],
            name: payload.name,
            nickname: payload.nickname,
            picture: payload.picture,
            groups: Array.isArray(roles) ? roles : [roles].filter(Boolean),
            [ROLES_CLAIM]: Array.isArray(roles) ? roles : [roles].filter(Boolean),
            ...payload,
          },
          accessToken: token,
        };
      } catch (error) {
        console.error('Bearer JWT validation failed:', error.message);
        // Fall through to cookie session
      }
    }
  }

  try {
    const session = request ? await getSession(request) : await getSession();
    if (session?.user) {
      return session;
    }
  } catch (error) {
    console.error('Cookie session lookup failed:', error.message);
  }

  return null;
}

/**
 * True if session user has Admin or Doctor role (case-insensitive / partial).
 */
export function hasAdminOrDoctorRole(user) {
  const roles = user?.groups || user?.[ROLES_CLAIM] || [];
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => {
    const r = String(role).toLowerCase();
    return r === 'admin' || r === 'doctor' || r.includes('admin') || r.includes('doctor');
  });
}

/**
 * True if session user has the Admin role (not Doctor-only).
 * Used for sensitive actions like changing another user's role.
 */
export function hasAdminRole(user) {
  const roles = user?.groups || user?.[ROLES_CLAIM] || [];
  if (!Array.isArray(roles)) return false;
  return roles.some((role) => {
    const r = String(role).toLowerCase();
    return r === 'admin' || (r.includes('admin') && !r.includes('doctor'));
  });
}

export { ROLES_CLAIM };
