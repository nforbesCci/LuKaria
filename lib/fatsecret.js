/**
 * FatSecret Platform API (server-only) — client_credentials search.
 */

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function cleanEnv(value) {
  if (value == null) return '';
  let v = String(value).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

async function getFatSecretToken() {
  const clientId = cleanEnv(process.env.FATSECRET_CLIENT_ID);
  const clientSecret = cleanEnv(process.env.FATSECRET_CLIENT_SECRET);
  if (!clientId || !clientSecret) {
    throw new Error('FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET are not configured');
  }
  if (cachedToken && Date.now() < cachedTokenExpiresAt - 30_000) {
    return cachedToken;
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'basic',
  });
  const response = await fetch('https://oauth.fatsecret.com/connect/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'FatSecret auth failed');
  }
  cachedToken = data.access_token;
  cachedTokenExpiresAt = Date.now() + (Number(data.expires_in) || 3600) * 1000;
  return cachedToken;
}

export async function searchFoods(searchExpression, { maxResults = 5 } = {}) {
  const token = await getFatSecretToken();
  const params = new URLSearchParams({
    method: 'foods.search',
    search_expression: searchExpression,
    format: 'json',
    max_results: String(maxResults),
  });
  const response = await fetch('https://platform.fatsecret.com/rest/server.api', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'FatSecret search failed');
  }
  const foods = data.foods?.food;
  const list = Array.isArray(foods) ? foods : foods ? [foods] : [];
  return list.map((f) => ({
    foodId: f.food_id,
    name: f.food_name,
    description: f.food_description,
    type: f.food_type,
  }));
}

/** Parse calories from FatSecret description like "Per 100g - Calories: 52kcal | Fat: ..." */
export function parseCaloriesFromDescription(description) {
  if (!description) return null;
  const text = String(description);
  const patterns = [
    /Calories:\s*([\d.]+)\s*kcal/i,
    /Calories:\s*([\d.]+)/i,
    /([\d.]+)\s*kcal/i,
  ];
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (!m) continue;
    const n = Number(m[1]);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export async function resolveCaloriesForFoodName(name) {
  const results = await searchFoods(name, { maxResults: 3 });
  const best = results[0];
  if (!best) {
    return { name, calories: null, source: null, fatSecret: null };
  }
  return {
    name: best.name || name,
    calories: parseCaloriesFromDescription(best.description),
    source: 'fatsecret',
    fatSecret: best,
  };
}
