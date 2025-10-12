import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const pageSize = searchParams.get('pageSize') || '25';
    const pageNumber = searchParams.get('pageNumber') || '1';

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
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

    console.log('🔍 Searching USDA Food Database for:', query);

    // Call USDA Food Data Central API
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&pageNumber=${pageNumber}&api_key=${apiKey}`;
    
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
          error: 'Failed to fetch from USDA API',
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log('✅ USDA API Response:', {
      totalHits: data.totalHits,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      foods: data.foods?.length || 0
    });

    // Transform the response to a simpler format
    const transformedFoods = data.foods?.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName || food.brandOwner,
      dataType: food.dataType,
      servingSize: food.servingSize,
      servingSizeUnit: food.servingSizeUnit,
      householdServingFullText: food.householdServingFullText,
      nutrients: food.foodNutrients?.map(nutrient => ({
        nutrientId: nutrient.nutrientId,
        nutrientName: nutrient.nutrientName,
        nutrientNumber: nutrient.nutrientNumber,
        unitName: nutrient.unitName,
        value: nutrient.value
      })) || [],
      // Extract key nutrients for easy access
      calories: food.foodNutrients?.find(n => n.nutrientName === 'Energy')?.value || 0,
      protein: food.foodNutrients?.find(n => n.nutrientName === 'Protein')?.value || 0,
      carbs: food.foodNutrients?.find(n => n.nutrientName === 'Carbohydrate, by difference')?.value || 0,
      fat: food.foodNutrients?.find(n => n.nutrientName === 'Total lipid (fat)')?.value || 0,
      fiber: food.foodNutrients?.find(n => n.nutrientName === 'Fiber, total dietary')?.value || 0,
      sugar: food.foodNutrients?.find(n => n.nutrientName === 'Sugars, total including NLEA')?.value || 0,
    })) || [];

    return NextResponse.json({
      success: true,
      query: query,
      totalHits: data.totalHits,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      pageSize: pageSize,
      foods: transformedFoods
    });

  } catch (error) {
    console.error('❌ Error searching food database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search food database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

