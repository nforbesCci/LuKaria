/**
 * Calendly Scheduling API helpers (server-only).
 * Auth: CALENDLY_PERSONAL_ACCESS_TOKEN / CALENDLY_TOKEN env, or calendar_config.apiToken in Mongo.
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

/** Normalize an instant to Calendly-friendly ISO-8601 UTC (`...Z`, no millis). */
export function normalizeCalendlyInstant(value) {
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) {
    throw new Error('Invalid date/time for Calendly');
  }
  return new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z');
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
    const paramDetails = Array.isArray(data?.details)
      ? data.details
          .map((d) =>
            d?.parameter
              ? `${d.parameter}: ${d.message || 'invalid'}`
              : d?.message || null,
          )
          .filter(Boolean)
          .join('; ')
      : '';
    let message =
      data?.message ||
      data?.title ||
      paramDetails ||
      `Calendly request failed (${response.status})`;
    if (paramDetails && data?.message) {
      message = `${data.message} (${paramDetails})`;
    }
    if (
      /supplied parameters are invalid/i.test(String(message)) &&
      String(path).includes('event_type_available_times')
    ) {
      message = `${message} Usually this means start_time was in the past, the range exceeds 7 days, or event_type is wrong/inactive.`;
    }
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

/** Normalize Calendly scheduling page URLs for comparison. */
export function normalizeSchedulingUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    const u = new URL(url.trim());
    u.hash = '';
    u.search = '';
    let path = u.pathname.replace(/\/+$/, '');
    return `${u.origin}${path}`.toLowerCase();
  } catch {
    return String(url).trim().replace(/\/+$/, '').toLowerCase();
  }
}

/**
 * Resolve a Calendly Event Type API URI from a public scheduling URL
 * (e.g. https://calendly.com/you/30min → https://api.calendly.com/event_types/…).
 */
export async function resolveEventTypeUriFromSchedulingUrl(token, schedulingUrl) {
  const target = normalizeSchedulingUrl(schedulingUrl);
  if (!target || !token) return null;
  if (String(schedulingUrl).includes('api.calendly.com/event_types/')) {
    return String(schedulingUrl).trim();
  }
  const types = await listEventTypes(token);
  const match = types.find(
    (t) => t.active !== false && normalizeSchedulingUrl(t.schedulingUrl) === target,
  );
  return match?.uri || null;
}

/**
 * List available times. Calendly rejects past start_time and spans > 7 days
 * with a generic "supplied parameters are invalid" error.
 */
export async function listAvailableTimes(token, { eventTypeUri, startTime, endTime }) {
  if (!eventTypeUri || !startTime || !endTime) {
    throw new Error('eventTypeUri, startTime, and endTime are required');
  }
  if (!String(eventTypeUri).includes('api.calendly.com/event_types/')) {
    throw new Error(
      'Invalid Calendly event type URI. Import types from Calendly in System Settings → Calendar so each type has an API URI.',
    );
  }

  const now = Date.now();
  let startMs = new Date(startTime).getTime();
  let endMs = new Date(endTime).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new Error('startTime and endTime must be valid dates');
  }

  // Past start_time → Calendly 400 "The supplied parameters are invalid"
  if (startMs < now) {
    startMs = now + 60 * 1000;
  }
  // Calendly allows at most 7 days; keep strictly under to avoid edge rejections
  const maxSpanMs = 7 * 24 * 60 * 60 * 1000 - 1000;
  if (endMs - startMs > maxSpanMs) {
    endMs = startMs + maxSpanMs;
  }
  if (endMs <= startMs) {
    endMs = startMs + 6 * 24 * 60 * 60 * 1000;
  }

  const data = await calendlyFetch('/event_type_available_times', {
    token,
    query: {
      event_type: eventTypeUri,
      start_time: normalizeCalendlyInstant(startMs),
      end_time: normalizeCalendlyInstant(endMs),
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

/**
 * Book via Scheduling API (Create Event Invitee).
 * @see https://developer.calendly.com/api-docs/p3ghrxrwbl8kqe-create-event-invitee-scheduling-api
 */
export async function createInvitee(
  token,
  { eventTypeUri, startTime, name, email, timezone = 'America/Jamaica' },
) {
  if (!eventTypeUri || !startTime || !email) {
    throw new Error('eventTypeUri, startTime, and email are required');
  }
  if (!String(eventTypeUri).includes('api.calendly.com/event_types/')) {
    throw new Error(
      'Invalid Calendly event type URI. Import types from Calendly in System Settings → Calendar.',
    );
  }

  const inviteeName = String(name || email).trim() || email;
  const data = await calendlyFetch('/invitees', {
    token,
    method: 'POST',
    body: {
      event_type: eventTypeUri,
      start_time: normalizeCalendlyInstant(startTime),
      invitee: {
        name: inviteeName,
        email: String(email).trim().toLowerCase(),
        timezone: timezone || calendlyDefaultTimezone(),
      },
    },
  });
  return data.resource || data;
}
