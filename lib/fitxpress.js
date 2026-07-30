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

/** Public fields safe to return to clients (no vendor token leakage). */
export function sanitizeMeasurement(m) {
  if (!m) return null;
  return {
    id: m.id,
    status: m.status,
    gender: m.gender,
    height: m.height,
    weight: m.weight,
    estimated_weight: m.estimated_weight,
    age: m.age,
    fat_percentage: m.fat_percentage,
    bmi: m.bmi,
    estimated_bmi: m.estimated_bmi,
    bmr: m.bmr,
    estimated_bmr: m.estimated_bmr,
    fat_body_mass: m.fat_body_mass,
    lean_body_mass: m.lean_body_mass,
    model_3d_url: m.model_3d_url,
    circumference_params: m.circumference_params || {},
    front_linear_params: m.front_linear_params || {},
    side_linear_params: m.side_linear_params || {},
    created_at: m.created_at,
    completed_at: m.completed_at,
    updated_at: m.updated_at,
    errors: m.errors || [],
    predicted_models: m.predicted_models || [],
  };
}
