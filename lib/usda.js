/**
 * USDA FoodData Central helpers (server-only).
 * @see https://fdc.nal.usda.gov/api-guide
 */

function getUsdaApiKey() {
  const apiKey = process.env.USDA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('USDA_API_KEY is not configured');
  }
  return apiKey;
}

/** Prefer Energy in kcal (nutrient 208); ignore kJ when kcal is present. */
export function extractEnergyKcalFromNutrients(nutrients) {
  if (!Array.isArray(nutrients) || nutrients.length === 0) return null;

  const normalized = nutrients.map((n) => ({
    id: n.nutrientId ?? n.nutrientNumber ?? n.nutrient?.id ?? n.nutrient?.number,
    name: String(n.nutrientName || n.nutrient?.name || '').toLowerCase(),
    unit: String(n.unitName || n.nutrient?.unitName || '').toUpperCase(),
    value: Number(n.value ?? n.amount),
  }));

  const kcal =
    normalized.find(
      (n) =>
        (String(n.id) === '208' || n.name === 'energy') &&
        n.unit === 'KCAL' &&
        Number.isFinite(n.value),
    ) ||
    normalized.find(
      (n) =>
        (String(n.id) === '208' || n.name === 'energy') &&
        Number.isFinite(n.value) &&
        n.unit !== 'KJ',
    );

  if (!kcal) return null;
  return kcal.value;
}

/**
 * Search FDC and return the best calorie match (typically kcal per 100g).
 * Prefers Foundation / SR Legacy / Survey over Branded snacks.
 * @see https://fdc.nal.usda.gov/api-guide
 */
export async function searchUsdaFoods(query, { pageSize = 15 } = {}) {
  const apiKey = getUsdaApiKey();
  const params = new URLSearchParams({
    query,
    pageSize: String(pageSize),
    pageNumber: '1',
    api_key: apiKey,
  });
  const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?${params.toString()}`;
  const response = await fetch(usdaUrl, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `USDA search returned non-JSON (${response.status}): ${text.slice(0, 120)}`,
    );
  }
  if (!response.ok) {
    throw new Error(data.message || data.error || `USDA search failed (${response.status})`);
  }

  const foods = Array.isArray(data.foods) ? data.foods : [];
  const preferredOrder = {
    Foundation: 0,
    'SR Legacy': 1,
    'Survey (FNDDS)': 2,
    Branded: 3,
  };

  return foods
    .map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType,
      caloriesPer100g: extractEnergyKcalFromNutrients(food.foodNutrients),
      brandName: food.brandName || food.brandOwner || null,
    }))
    .sort((a, b) => {
      const ra = preferredOrder[a.dataType] ?? 9;
      const rb = preferredOrder[b.dataType] ?? 9;
      if (ra !== rb) return ra - rb;
      const ca = Number.isFinite(a.caloriesPer100g) ? 0 : 1;
      const cb = Number.isFinite(b.caloriesPer100g) ? 0 : 1;
      return ca - cb;
    });
}

/**
 * Resolve calories for a food name via USDA FoodData Central.
 * Returns kcal for the portion when estimatedGrams is provided; otherwise per-100g.
 */
export async function resolveCaloriesFromUsda(name, { estimatedGrams = null } = {}) {
  let results = await searchUsdaFoods(name, { pageSize: 30 });

  // If top hits are branded/dried snacks, try a fresh-produce query.
  const hasFresh = results.some(
    (f) =>
      Number.isFinite(f.caloriesPer100g) &&
      f.caloriesPer100g > 0 &&
      f.caloriesPer100g < 200 &&
      f.dataType !== 'Branded',
  );
  if (!hasFresh) {
    const fresh = await searchUsdaFoods(`${name} raw`, { pageSize: 30 });
    if (fresh.length) results = fresh;
  }

  const best =
    results.find(
      (f) =>
        Number.isFinite(f.caloriesPer100g) &&
        f.caloriesPer100g > 0 &&
        f.dataType !== 'Branded',
    ) ||
    results.find((f) => Number.isFinite(f.caloriesPer100g) && f.caloriesPer100g > 0) ||
    results[0];

  if (!best || !Number.isFinite(best.caloriesPer100g) || best.caloriesPer100g <= 0) {
    return {
      name,
      calories: null,
      caloriesPer100g: null,
      source: null,
      usda: null,
    };
  }

  const grams = Number(estimatedGrams);
  const calories =
    Number.isFinite(grams) && grams > 0
      ? (best.caloriesPer100g * grams) / 100
      : best.caloriesPer100g;

  return {
    name: best.description || name,
    calories: Math.round(calories * 10) / 10,
    caloriesPer100g: best.caloriesPer100g,
    source: 'usda',
    usda: best,
  };
}
