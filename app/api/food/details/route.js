import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fdcId = searchParams.get('fdcId');

    if (!fdcId) {
      return NextResponse.json(
        { error: 'Food ID (fdcId) is required' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.USDA_API_KEY;
    
    if (!apiKey) {
      console.error('❌ USDA API key not configured');
      return NextResponse.json(
        { error: 'USDA API key not configured. Please add USDA_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    console.log('🔍 Fetching food details for FDC ID:', fdcId);

    // Call USDA Food Data Central API for specific food
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${apiKey}`;
    
    const response = await fetch(usdaUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ USDA API Error:', response.status, errorText);
      return NextResponse.json(
        { 
          error: 'Failed to fetch food details from USDA API',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const food = await response.json();
    
    console.log('✅ USDA API Food Details Retrieved:', {
      fdcId: food.fdcId,
      description: food.description,
      dataType: food.dataType
    });

    // Transform the response to a consistent format
    const transformedFood = {
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName || food.brandOwner,
      dataType: food.dataType,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      householdServingFullText: food.householdServingFullText,
      ingredients: food.ingredients,
      nutrients: food.foodNutrients?.map(nutrient => ({
        nutrientId: nutrient.nutrient?.id,
        nutrientName: nutrient.nutrient?.name,
        nutrientNumber: nutrient.nutrient?.number,
        unitName: nutrient.nutrient?.unitName,
        value: nutrient.amount
      })) || [],
      // Extract key nutrients for easy access
      calories: food.foodNutrients?.find(n => n.nutrient?.name === 'Energy')?.amount || 0,
      protein: food.foodNutrients?.find(n => n.nutrient?.name === 'Protein')?.amount || 0,
      carbs: food.foodNutrients?.find(n => n.nutrient?.name === 'Carbohydrate, by difference')?.amount || 0,
      fat: food.foodNutrients?.find(n => n.nutrient?.name === 'Total lipid (fat)')?.amount || 0,
      fiber: food.foodNutrients?.find(n => n.nutrient?.name === 'Fiber, total dietary')?.amount || 0,
      sugar: food.foodNutrients?.find(n => n.nutrient?.name === 'Sugars, total including NLEA')?.amount || 0,
      sodium: food.foodNutrients?.find(n => n.nutrient?.name === 'Sodium, Na')?.amount || 0,
      cholesterol: food.foodNutrients?.find(n => n.nutrient?.name === 'Cholesterol')?.amount || 0,
    };

    return NextResponse.json({
      success: true,
      food: transformedFood
    });

  } catch (error) {
    console.error('❌ Error fetching food details:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch food details',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

