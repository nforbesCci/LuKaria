import { getSession } from '@auth0/nextjs-auth0';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const ROLES_CLAIM = 'https://lukariagroup.com/roles';

/** @type {Map<string, ReturnType<typeof createRemoteJWKSet>>} */
const jwksByIssuer = new Map();

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

function getJwksForIssuer(issuer) {
  const normalized = issuer.replace(/\/$/, '');
  let jwks = jwksByIssuer.get(normalized);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`${normalized}/.well-known/jwks.json`));
    jwksByIssuer.set(normalized, jwks);
  }
  return jwks;
}

function audienceMatches(payload, allowed) {
  if (!allowed.length) return true;
  const aud = payload.aud;
  const candidates = [
    ...(Array.isArray(aud) ? aud : aud ? [aud] : []),
    payload.azp,
    payload.client_id,
  ].filter(Boolean);
  return candidates.some((value) => allowed.includes(String(value)));
}

function sessionFromPayload(payload, token) {
  const roles =
    payload[ROLES_CLAIM] ||
    payload.roles ||
    payload['https://lukariagroup.com/roles'] ||
    [];

  return {
    user: {
      sub: payload.sub,
      email: payload.email || payload['https://lukariagroup.com/email'],
      name: payload.name,
      nickname: payload.nickname,
      picture: payload.picture,
      groups: Array.isArray(roles) ? roles : [roles].filter(Boolean),
      [ROLES_CLAIM]: Array.isArray(roles) ? roles : [roles].filter(Boolean),
      ...payload,
    },
    accessToken: token,
  };
}

/**
 * Verify a mobile/web Bearer JWT. Signature + issuer are required.
 * Audience is checked manually against API identifier and Auth0 client IDs so
 * both API access_tokens and native id_tokens are accepted.
 */
async function verifyBearerToken(token) {
  const issuers = allowedIssuers();
  if (!issuers.length) {
    throw new Error('No Auth0 issuer configured (AUTH0_ISSUER_BASE_URL / AUTH0_DOMAIN)');
  }

  const allowedAud = allowedAudiences();
  const errors = [];

  for (const issuer of issuers) {
    try {
      // Do not pass `audience` to jose — Auth0 id_tokens use client_id while
      // API access tokens use AUTH0_AUDIENCE; we accept either via allow-list.
      const { payload } = await jwtVerify(token, getJwksForIssuer(issuer), {
        issuer,
        algorithms: ['RS256'],
      });

      if (!audienceMatches(payload, allowedAud)) {
        errors.push(
          `issuer ${issuer}: audience mismatch (aud=${JSON.stringify(payload.aud)} azp=${payload.azp || ''})`,
        );
        continue;
      }

      return sessionFromPayload(payload, token);
    } catch (error) {
      errors.push(`issuer ${issuer}: ${error.message}`);
    }
  }

  throw new Error(errors.join(' | ') || 'JWT verification failed');
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
        return await verifyBearerToken(token);
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
