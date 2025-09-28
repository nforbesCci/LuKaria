import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { barcode } = await req.json();
    
    if (!barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // Look up product in Open Food Facts
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    
    if (data.status === 1 && data.product) {
      const product = data.product;
      
      // Extract relevant nutritional information
      const productInfo = {
        name: product.product_name || product.product_name_en || 'Unknown Product',
        brand: product.brands || '',
        calories: product.nutriments?.['energy-kcal_100g'] || 
                 (product.nutriments?.['energy_100g'] ? 
                  Math.round(product.nutriments['energy_100g'] / 4.184) : null),
        servingSize: product.serving_size || '100g',
        ingredients: product.ingredients_text || '',
        nutritionGrade: product.nutrition_grades || '',
        image: product.image_url || product.image_front_url || '',
        source: 'Open Food Facts',
        barcode: barcode,
        // Additional nutritional data
        nutrition: {
          fat: product.nutriments?.['fat_100g'],
          saturatedFat: product.nutriments?.['saturated-fat_100g'],
          carbohydrates: product.nutriments?.['carbohydrates_100g'],
          sugars: product.nutriments?.['sugars_100g'],
          fiber: product.nutriments?.['fiber_100g'],
          proteins: product.nutriments?.['proteins_100g'],
          salt: product.nutriments?.['salt_100g'],
          sodium: product.nutriments?.['sodium_100g'],
        },
        // Health indicators
        additives: product.additives_tags || [],
        allergens: product.allergens_tags || [],
        nutritionScore: product.nutrition_grade_fr || product.nutrition_grades || '',
        novaGroup: product.nova_group || null, // 1-4 scale for food processing
        ecoscoreGrade: product.ecoscore_grade || null,
      };
      
      return NextResponse.json({ success: true, product: productInfo }, { status: 200 });
    } else {
      // Product not found in Open Food Facts
      return NextResponse.json({ 
        success: false, 
        message: 'Product not found in Open Food Facts database',
        suggestGoogleLens: true,
        barcode: barcode
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Product lookup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to lookup product information',
      details: error.message 
    }, { status: 500 });
  }
}
