import { NextResponse } from 'next/server';
import { getApiSession } from '../../../../lib/api-auth';
import { identifyFoodsFromPhoto } from '../../../../lib/gemini';
import { resolveFoodCalories } from '../../../../lib/nutrition';

export const dynamic = 'force-dynamic';

const MEAL_SLOTS = new Set([
  'breakfast',
  'morning_snack',
  'lunch',
  'afternoon_snack',
  'dinner',
  'supper',
]);

export async function POST(request) {
  try {
    const session = await getApiSession(request);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const image = body.image || body.photo;
    const mealType = String(body.mealType || body.slot || '').trim();
    const date = body.date;

    if (!image) {
      return NextResponse.json({ error: 'image is required' }, { status: 400 });
    }
    if (!MEAL_SLOTS.has(mealType)) {
      return NextResponse.json(
        { error: 'mealType must be one of breakfast, morning_snack, lunch, afternoon_snack, dinner, supper' },
        { status: 400 },
      );
    }

    const identified = await identifyFoodsFromPhoto(image);
    const items = [];
    for (const food of identified) {
      const resolved = await resolveFoodCalories(food);
      items.push({
        name: resolved.name || food.name,
        portion: food.portion,
        estimatedGrams: food.estimatedGrams,
        calories: resolved.calories,
        mealType,
        servingSize: food.portion,
        calorieSource: resolved.source,
        fatSecret: resolved.fatSecret,
        usda: resolved.usda,
      });
    }

    const totalCalories = items.reduce(
      (sum, item) => sum + (Number.isFinite(item.calories) ? item.calories : 0),
      0,
    );

    return NextResponse.json({
      success: true,
      date: date || null,
      mealType,
      items,
      totalCalories: Math.round(totalCalories * 10) / 10,
      photoAttached: true,
    });
  } catch (error) {
    console.error('analyze-photo error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze meal photo' },
      { status: 500 },
    );
  }
}
