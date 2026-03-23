/**
 * Optional external profile URLs for JSON-LD sameAs (Organization / Person).
 * Set NEXT_PUBLIC_ORG_SAME_AS to comma-separated HTTPS URLs, e.g.:
 *   https://www.facebook.com/yourpage,https://www.instagram.com/yourprofile
 * Omit or leave empty if you have no public social profiles to disclose.
 */
function parseUrlList(envValue) {
  if (!envValue || typeof envValue !== 'string') return [];
  return envValue
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

/** Organization / MedicalOrganization sameAs (external only) */
export function getOrganizationSameAs() {
  return parseUrlList(process.env.NEXT_PUBLIC_ORG_SAME_AS);
}

/** Physician Person sameAs — separate list if you use different profiles */
export function getPhysicianSameAs() {
  const fromEnv = parseUrlList(process.env.NEXT_PUBLIC_PHYSICIAN_SAME_AS);
  if (fromEnv.length > 0) return fromEnv;
  return parseUrlList(process.env.NEXT_PUBLIC_ORG_SAME_AS);
}
