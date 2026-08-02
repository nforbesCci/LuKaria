import { getSetting, setSetting, isMaskedSecret, maskSecret, appBaseUrl } from './settings';

export const CALENDAR_SETTING_KEY = 'calendar_config';

export const DEFAULT_BOOKING_URL =
  'https://calendly.com/kadriaf-lukariagroup/weight-loss-consultation';

export const CALENDAR_PROVIDERS = [
  {
    id: 'calendly',
    label: 'Calendly',
    hint: 'Paste your Calendly event or scheduling page URL (e.g. https://calendly.com/you/30min).',
  },
  {
    id: 'calcom',
    label: 'Cal.com',
    hint: 'Paste your Cal.com booking link (e.g. https://cal.com/you/consultation).',
  },
  {
    id: 'outlook',
    label: 'Outlook / Microsoft Bookings',
    hint: 'Paste an Outlook Bookings page or shared calendar booking link.',
  },
  {
    id: 'google',
    label: 'Google Calendar',
    hint: 'Paste a Google Appointment Schedule or calendar booking link.',
  },
];

export const DEFAULT_CALENDAR_CONFIG = {
  provider: 'calendly',
  bookingUrl: DEFAULT_BOOKING_URL,
  eventTypeUrl: '',
  eventTypeUri: '',
  bookingLabel: 'Book an appointment',
  enabled: true,
  apiToken: '',
  webhookSigningKey: '',
  appointmentTypes: [],
};

/**
 * @param {unknown} raw
 * @param {number} [index]
 */
export function normalizeAppointmentType(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || '').trim();
  if (!name) return null;
  const id = String(raw.id || '').trim() || `type-${index + 1}`;
  const durationRaw = raw.durationMinutes;
  let durationMinutes = null;
  if (durationRaw !== '' && durationRaw != null) {
    const n = Number(durationRaw);
    if (Number.isFinite(n) && n > 0) durationMinutes = Math.round(n);
  }
  return {
    id,
    name,
    durationMinutes,
    eventTypeUrl: String(raw.eventTypeUrl || '').trim(),
    eventTypeUri: String(raw.eventTypeUri || '').trim(),
    enabled: raw.enabled !== false,
  };
}

export function parseAppointmentTypes(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  raw.forEach((item, index) => {
    const type = normalizeAppointmentType(item, index);
    if (!type) return;
    let id = type.id;
    if (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    out.push({ ...type, id });
  });
  return out;
}

export function parseCalendarConfig(raw) {
  if (!raw) return { ...DEFAULT_CALENDAR_CONFIG, appointmentTypes: [] };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const provider = CALENDAR_PROVIDERS.some((p) => p.id === parsed.provider)
      ? parsed.provider
      : DEFAULT_CALENDAR_CONFIG.provider;
    return {
      provider,
      bookingUrl: String(parsed.bookingUrl || DEFAULT_CALENDAR_CONFIG.bookingUrl).trim(),
      eventTypeUrl: String(
        parsed.eventTypeUrl || parsed.bookingUrl || DEFAULT_CALENDAR_CONFIG.eventTypeUrl || '',
      ).trim(),
      eventTypeUri: String(parsed.eventTypeUri || DEFAULT_CALENDAR_CONFIG.eventTypeUri || '').trim(),
      bookingLabel: String(
        parsed.bookingLabel || DEFAULT_CALENDAR_CONFIG.bookingLabel,
      ).trim(),
      enabled: parsed.enabled !== false,
      apiToken: typeof parsed.apiToken === 'string' ? parsed.apiToken : '',
      webhookSigningKey:
        typeof parsed.webhookSigningKey === 'string' ? parsed.webhookSigningKey : '',
      appointmentTypes: parseAppointmentTypes(parsed.appointmentTypes),
    };
  } catch {
    return { ...DEFAULT_CALENDAR_CONFIG, appointmentTypes: [] };
  }
}

export async function getCalendarConfig() {
  const doc = await getSetting(CALENDAR_SETTING_KEY);
  if (!doc?.value) {
    await setSetting(CALENDAR_SETTING_KEY, JSON.stringify(DEFAULT_CALENDAR_CONFIG));
    return { ...DEFAULT_CALENDAR_CONFIG };
  }
  return parseCalendarConfig(doc.value);
}

function resolveSecret(existingValue, incoming) {
  if (typeof incoming !== 'string') return existingValue || '';
  if (!incoming.trim() || isMaskedSecret(incoming)) {
    return existingValue || '';
  }
  return incoming.trim();
}

export async function saveCalendarConfig(updates = {}) {
  const existing = await getCalendarConfig();
  const apiToken = resolveSecret(existing.apiToken, updates.apiToken);
  const webhookSigningKey = resolveSecret(
    existing.webhookSigningKey,
    updates.webhookSigningKey,
  );

  const appointmentTypes =
    updates.appointmentTypes !== undefined
      ? parseAppointmentTypes(updates.appointmentTypes)
      : existing.appointmentTypes;

  for (const type of appointmentTypes) {
    if (!type.eventTypeUri && !type.eventTypeUrl) {
      throw new Error(
        `Appointment type "${type.name}" needs an Event type URL or Event Type API URI`,
      );
    }
  }

  const next = parseCalendarConfig({
    ...existing,
    ...updates,
    apiToken,
    webhookSigningKey,
    appointmentTypes,
  });

  if (!next.bookingUrl) {
    throw new Error('Booking URL is required');
  }

  if (!next.eventTypeUrl) {
    next.eventTypeUrl = next.bookingUrl;
  }

  await setSetting(CALENDAR_SETTING_KEY, JSON.stringify(next));
  return next;
}

export function toCalendarAdminView(config) {
  return {
    provider: config.provider,
    bookingUrl: config.bookingUrl,
    eventTypeUrl: config.eventTypeUrl || config.bookingUrl,
    eventTypeUri: config.eventTypeUri || '',
    bookingLabel: config.bookingLabel,
    enabled: config.enabled,
    apiToken: maskSecret(config.apiToken) || '',
    hasApiToken: Boolean(config.apiToken),
    webhookSigningKey: maskSecret(config.webhookSigningKey) || '',
    hasWebhookSigningKey: Boolean(config.webhookSigningKey),
    webhookUrl: `${appBaseUrl()}/api/calendly/webhook`,
    appointmentTypes: parseAppointmentTypes(config.appointmentTypes),
  };
}

export function toCalendarPublicView(config) {
  const bookingUrl = config.enabled
    ? config.bookingUrl
    : DEFAULT_CALENDAR_CONFIG.bookingUrl;
  return {
    provider: config.provider,
    bookingUrl,
    eventTypeUrl: config.enabled
      ? config.eventTypeUrl || config.bookingUrl
      : DEFAULT_CALENDAR_CONFIG.bookingUrl,
    bookingLabel: config.bookingLabel || DEFAULT_CALENDAR_CONFIG.bookingLabel,
    enabled: config.enabled !== false,
  };
}

export async function getPublicBookingUrl() {
  const config = await getCalendarConfig();
  return toCalendarPublicView(config).bookingUrl;
}
