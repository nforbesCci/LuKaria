/**
 * Calendly Scheduling API helpers (server-only).
 * Auth: CALENDLY_PERSONAL_ACCESS_TOKEN env, or calendar_config.apiToken in Mongo.
 */

const CALENDLY_API = 'https://api.calendly.com';

export async function resolveCalendlyToken(configApiToken) {
  const fromEnv =
    process.env.CALENDLY_PERSONAL_ACCESS_TOKEN?.trim() ||
    process.env.CALENDLY_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  if (configApiToken?.trim()) return configApiToken.trim();
  throw new Error('Calendly API token is not configured');
}

export function calendlyOrganizationUri() {
  const id = process.env.CALENDLY_ORGANIZATION_ID?.trim();
  if (!id) return null;
  if (id.startsWith('http')) return id;
  return `https://api.calendly.com/organizations/${id}`;
}

export function calendlyDefaultTimezone() {
  return process.env.CALENDLY_DEFAULT_TIMEZONE?.trim() || 'America/Jamaica';
}

async function calendlyFetch(path, { token, method = 'GET', body, query } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${CALENDLY_API}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v != null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    const message =
      data?.message ||
      data?.title ||
      (Array.isArray(data?.details) && data.details.map((d) => d.message).join('; ')) ||
      `Calendly request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function getCurrentUser(token) {
  const data = await calendlyFetch('/users/me', { token });
  return data.resource;
}

export async function listEventTypes(token, { userUri, organizationUri } = {}) {
  const query = {};
  const orgFromEnv = calendlyOrganizationUri();
  if (organizationUri) query.organization = organizationUri;
  else if (orgFromEnv) query.organization = orgFromEnv;
  else if (userUri) query.user = userUri;
  else {
    const me = await getCurrentUser(token);
    if (me.current_organization) query.organization = me.current_organization;
    else query.user = me.uri;
  }
  const data = await calendlyFetch('/event_types', { token, query: { ...query, count: 100 } });
  return (data.collection || []).map((et) => ({
    uri: et.uri,
    name: et.name,
    duration: et.duration,
    slug: et.slug,
    schedulingUrl: et.scheduling_url,
    active: et.active !== false,
  }));
}

export async function listAvailableTimes(token, { eventTypeUri, startTime, endTime }) {
  const data = await calendlyFetch('/event_type_available_times', {
    token,
    query: {
      event_type: eventTypeUri,
      start_time: startTime,
      end_time: endTime,
    },
  });
  return (data.collection || [])
    .filter((slot) => slot.status === 'available')
    .map((slot) => ({
      startTime: slot.start_time,
      status: slot.status,
      inviteesRemaining: slot.invitees_remaining,
    }));
}

export async function createInvitee(
  token,
  { eventTypeUri, startTime, name, email, timezone = 'America/Jamaica' },
) {
  const parts = String(name || '').trim().split(/\s+/);
  const firstName = parts[0] || 'Patient';
  const lastName = parts.slice(1).join(' ') || 'LuKaria';
  const data = await calendlyFetch('/invitees', {
    token,
    method: 'POST',
    body: {
      event_type: eventTypeUri,
      start_time: startTime,
      invitee: {
        name: `${firstName} ${lastName}`.trim(),
        first_name: firstName,
        last_name: lastName,
        email,
        timezone,
      },
    },
  });
  return data.resource || data;
}
