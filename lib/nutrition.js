/**
 * Meal calorie resolution: FatSecret first, USDA FoodData Central backup.
 * @see https://fdc.nal.usda.gov/api-guide
 */

import { resolveCaloriesForFoodName as resolveFatSecret } from './fatsecret';
import { resolveCaloriesFromUsda } from './usda';

function scaleCalories(caloriesPerBasis, estimatedGrams, basisGrams = 100) {
  const kcal = Number(caloriesPerBasis);
  const grams = Number(estimatedGrams);
  if (!Number.isFinite(kcal) || kcal <= 0) return null;
  if (Number.isFinite(grams) && grams > 0 && basisGrams > 0) {
    return Math.round(((kcal * grams) / basisGrams) * 10) / 10;
  }
  return Math.round(kcal * 10) / 10;
}

/**
 * Resolve calories for an identified food.
 * 1) FatSecret (scale by grams when description is per-100g and grams known)
 * 2) USDA FDC when FatSecret is missing / zero / failed
 */
export async function resolveFoodCalories(food) {
  const name = String(food?.name || '').trim();
  const estimatedGrams = food?.estimatedGrams ?? null;
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
    if (per100 && Number.isFinite(Number(estimatedGrams)) && Number(estimatedGrams) > 0) {
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

  return {
    name,
    calories: null,
    source: null,
    fatSecret: fatSecretResult?.fatSecret || null,
    usda: null,
  };
}
