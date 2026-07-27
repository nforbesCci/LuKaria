import { getDatabase } from './mongodb';

/**
 * Key/value settings stored in MongoDB `settings` collection.
 */
export async function getSetting(key) {
  const db = await getDatabase();
  return db.collection('settings').findOne({ key });
}

export async function setSetting(key, value) {
  const db = await getDatabase();
  await db.collection('settings').updateOne(
    { key },
    { $set: { key, value, updatedAt: new Date() } },
    { upsert: true },
  );
}

export function maskSecret(secret) {
  if (!secret) return null;
  if (secret.length <= 8) return '********';
  return `${secret.substring(0, 4)}...${secret.substring(secret.length - 4)}`;
}

export function isMaskedSecret(secret) {
  return typeof secret === 'string' && secret.includes('...');
}

/**
 * Public base URL of this Next.js app (not the Auth0 issuer / custom domain).
 * Prefer AUTH0_BASE_URL — Auth0 SDK already treats that as the app origin.
 */
export function appBaseUrl() {
  const raw =
    process.env.AUTH0_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://localhost:3000');

  const cleaned = String(raw).replace(/\/$/, '');

  // Guard against mistaking Auth0 issuer / custom domain for the app URL
  const issuer = (process.env.AUTH0_ISSUER_BASE_URL || '').replace(/\/$/, '');
  if (issuer && cleaned === issuer && process.env.AUTH0_BASE_URL) {
    return String(process.env.AUTH0_BASE_URL).replace(/\/$/, '');
  }

  return cleaned;
}
