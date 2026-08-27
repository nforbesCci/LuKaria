const FITXPRESS_BASE =
  process.env.FITXPRESS_API_BASE || 'https://backend.fitxpress.3dlook.me/api/1.0';

function getAccessToken() {
  const token = process.env.FITXPRESS_ACCESS_TOKEN;
  if (!token) {
    throw new Error('FITXPRESS_ACCESS_TOKEN is not configured');
  }
  return token;
}

function authHeaders(extra = {}) {
  return {
    Authorization: `Token ${getAccessToken()}`,
    ...extra,
  };
}

/**
 * Create a FitXpress measurement from front/side photos (base64 data URLs or raw base64).
 * @see https://docs.fitxpress.3dlook.me/#overview
 */
export async function createMeasurement({
  height,
  weight,
  gender,
  age,
  frontPhoto,
  sidePhoto,
}) {
  const body = {
    height: Number(height),
    gender: String(gender).toLowerCase(),
    front_photo: normalizeDataUrl(frontPhoto),
    side_photo: normalizeDataUrl(sidePhoto),
  };
  if (weight != null && weight !== '') {
    body.weight = Number(weight);
  }
  if (age != null && age !== '') {
    body.age = Number(age);
  }

  const response = await fetch(`${FITXPRESS_BASE}/measurements/`, {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });

  const data = await parseJson(response);
  if (!response.ok) {
    throw fitxpressError(response.status, data);
  }
  return data;
}

export async function retrieveMeasurement(measurementId) {
  const response = await fetch(
    `${FITXPRESS_BASE}/measurements/${encodeURIComponent(measurementId)}/`,
    {
      method: 'GET',
      headers: authHeaders(),
    },
  );
  const data = await parseJson(response);
  if (!response.ok) {
    throw fitxpressError(response.status, data);
  }
  return data;
}

export async function getCurrentSubscription() {
  const response = await fetch(`${FITXPRESS_BASE}/subscriptions/current/`, {
    method: 'GET',
    headers: authHeaders(),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw fitxpressError(response.status, data);
  }
  return data;
}

function normalizeDataUrl(value) {
  if (!value || typeof value !== 'string') {
    throw new Error('Photo is required');
  }
  const trimmed = value.trim();
  if (trimmed.startsWith('data:')) {
    return trimmed;
  }
  return `data:image/jpeg;base64,${trimmed}`;
}

async function parseJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

function fitxpressError(status, data) {
  const detail =
    data?.detail ||
    data?.non_field_errors?.[0] ||
    (typeof data === 'object'
      ? Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('; ')
      : null) ||
    `FitXpress request failed (${status})`;
  const err = new Error(detail);
  err.status = status;
  err.payload = data;
  return err;
}

/** Coerce FitXpress numeric-ish values to finite numbers (or null). */
function toNum(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Keys that must never leave the server (photos / credentials). */
const STRIP_MEASUREMENT_KEYS = new Set([
  'front_photo',
  'side_photo',
  'front_photo_url',
  'side_photo_url',
  'photo',
  'photos',
  'token',
  'access_token',
  'api_token',
]);

/**
 * Store every FitXpress measurement field returned by the API.
 * Normalizes known numeric composition fields; keeps all other keys
 * (circumference_params, linear params, volume_params, etc.).
 */
export function sanitizeMeasurement(m) {
  if (!m) return null;

  const weight = toNum(m.weight);
  const estimated_weight = toNum(m.estimated_weight);
  const fat_percentage = toNum(m.fat_percentage);
  let fat_body_mass = toNum(m.fat_body_mass);
  let estimated_fat_body_mass = toNum(m.estimated_fat_body_mass);
  let lean_body_mass = toNum(m.lean_body_mass);
  let estimated_lean_body_mass = toNum(m.estimated_lean_body_mass);

  // Prefer primary, then estimated, then derive from weight × fat %.
  if (lean_body_mass == null) lean_body_mass = estimated_lean_body_mass;
  if (fat_body_mass == null) fat_body_mass = estimated_fat_body_mass;
  if (lean_body_mass == null || fat_body_mass == null) {
    const w = weight ?? estimated_weight;
    if (w != null && fat_percentage != null) {
      const derivedFat = (w * fat_percentage) / 100;
      const derivedLean = w - derivedFat;
      if (fat_body_mass == null) fat_body_mass = derivedFat;
      if (lean_body_mass == null) lean_body_mass = derivedLean;
    }
  }

  // Preserve the full FitXpress payload (minus photos/secrets).
  const out = {};
  for (const [key, value] of Object.entries(m)) {
    if (STRIP_MEASUREMENT_KEYS.has(key)) continue;
    out[key] = value;
  }

  Object.assign(out, {
    id: m.id,
    status: m.status,
    gender: m.gender,
    height: toNum(m.height) ?? m.height,
    weight,
    estimated_weight,
    age: toNum(m.age) ?? m.age,
    fat_percentage,
    bmi: toNum(m.bmi),
    estimated_bmi: toNum(m.estimated_bmi),
    bmr: toNum(m.bmr),
    estimated_bmr: toNum(m.estimated_bmr),
    fat_body_mass,
    estimated_fat_body_mass,
    lean_body_mass,
    estimated_lean_body_mass,
    model_3d_url: m.model_3d_url || null,
    circumference_params: m.circumference_params || {},
    front_linear_params: m.front_linear_params || {},
    side_linear_params: m.side_linear_params || {},
    volume_params: m.volume_params || {},
    created_at: m.created_at,
    completed_at: m.completed_at,
    updated_at: m.updated_at,
    errors: m.errors || [],
    predicted_models: m.predicted_models || [],
  });

  return out;
}
