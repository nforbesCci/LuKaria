/**
 * Meal calorie resolution: FatSecret first, USDA FoodData Central backup,
 * then a small common-food table so identified foods rarely stay at 0 kcal.
 * @see https://fdc.nal.usda.gov/api-guide
 */

import { resolveCaloriesForFoodName as resolveFatSecret } from './fatsecret';
import { resolveCaloriesFromUsda } from './usda';

/** Approximate kcal per 100g (raw/edible) when live APIs fail. */
const COMMON_KCAL_PER_100G = [
  { match: /\bmango\b/i, kcal: 60 },
  { match: /\bbanana\b/i, kcal: 89 },
  { match: /\bapple\b/i, kcal: 52 },
  { match: /\borange\b/i, kcal: 47 },
  { match: /\bgrape\b/i, kcal: 69 },
  { match: /\bpineapple\b/i, kcal: 50 },
  { match: /\bpapaya\b/i, kcal: 43 },
  { match: /\bwatermelon\b/i, kcal: 30 },
  { match: /\bstrawberry\b|\bstrawberries\b/i, kcal: 32 },
  { match: /\bavocado\b/i, kcal: 160 },
  { match: /\brice\b/i, kcal: 130 },
  { match: /\bchicken\b/i, kcal: 165 },
  { match: /\begg\b/i, kcal: 155 },
  { match: /\bbread\b/i, kcal: 265 },
  { match: /\bpotato\b/i, kcal: 77 },
  { match: /\btomato\b/i, kcal: 18 },
  { match: /\bcarrot\b/i, kcal: 41 },
  { match: /\bmilk\b/i, kcal: 42 },
  { match: /\byogurt\b|\byoghurt\b/i, kcal: 59 },
  { match: /\bcheese\b/i, kcal: 402 },
];

const DEFAULT_PORTION_GRAMS = 150;

function scaleCalories(caloriesPerBasis, estimatedGrams, basisGrams = 100) {
  const kcal = Number(caloriesPerBasis);
  const grams = Number(estimatedGrams);
  if (!Number.isFinite(kcal) || kcal <= 0) return null;
  if (Number.isFinite(grams) && grams > 0 && basisGrams > 0) {
    return Math.round(((kcal * grams) / basisGrams) * 10) / 10;
  }
  return Math.round(kcal * 10) / 10;
}

function resolveCommonFoodCalories(name, estimatedGrams) {
  const entry = COMMON_KCAL_PER_100G.find((row) => row.match.test(name));
  if (!entry) return null;
  const grams =
    Number.isFinite(Number(estimatedGrams)) && Number(estimatedGrams) > 0
      ? Number(estimatedGrams)
      : DEFAULT_PORTION_GRAMS;
  return {
    name,
    calories: scaleCalories(entry.kcal, grams, 100),
    source: 'estimate',
    fatSecret: null,
    usda: null,
  };
}

/**
 * Resolve calories for an identified food.
 * 1) FatSecret (scale by grams when description is per-100g and grams known)
 * 2) USDA FDC when FatSecret is missing / zero / failed
 * 3) Built-in estimate for common foods
 */
export async function resolveFoodCalories(food) {
  const name = String(food?.name || '').trim();
  let estimatedGrams = food?.estimatedGrams ?? null;
  if (!Number.isFinite(Number(estimatedGrams)) || Number(estimatedGrams) <= 0) {
    estimatedGrams = DEFAULT_PORTION_GRAMS;
  }
  if (!name) {
    return { name: '', calories: null, source: null, fatSecret: null, usda: null };
  }

  let fatSecretResult = null;
  try {
    fatSecretResult = await resolveFatSecret(name);
  } catch (err) {
    console.warn('FatSecret resolve failed for', name, err.message);
  }

  let calories = fatSecretResult?.calories;
  let source = fatSecretResult?.source || null;

  // FatSecret descriptions are usually "Per 100g - Calories: Xkcal"
  if (Number.isFinite(calories) && calories > 0) {
    const desc = String(fatSecretResult?.fatSecret?.description || '');
    const per100 = /per\s*100\s*g/i.test(desc);
    if (per100) {
      calories = scaleCalories(calories, estimatedGrams, 100);
    }
    return {
      name: fatSecretResult.name || name,
      calories,
      source: 'fatsecret',
      fatSecret: fatSecretResult.fatSecret,
      usda: null,
    };
  }

  try {
    const usda = await resolveCaloriesFromUsda(name, { estimatedGrams });
    if (Number.isFinite(usda.calories) && usda.calories > 0) {
      return {
        name: usda.name || name,
        calories: usda.calories,
        source: 'usda',
        fatSecret: fatSecretResult?.fatSecret || null,
        usda: usda.usda,
      };
    }
  } catch (err) {
    console.warn('USDA resolve failed for', name, err.message);
  }

  const estimate = resolveCommonFoodCalories(name, estimatedGrams);
  if (estimate) return estimate;

  return {
    name,
    calories: null,
    source: source || null,
    fatSecret: fatSecretResult?.fatSecret || null,
    usda: null,
  };
}
