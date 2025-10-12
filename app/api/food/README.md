# USDA Food API Integration

This folder contains API routes for searching and retrieving food data from the USDA Food Data Central database.

## Setup

### 1. Get USDA API Key

1. Visit https://fdc.nal.usda.gov/api-key-signup.html
2. Fill out the form to request an API key
3. You'll receive your API key via email

### 2. Add API Key to Environment

Add the following to your `.env.local` file:

```
USDA_API_KEY=your-api-key-here
```

## API Routes

### Search for Foods

**Endpoint:** `GET /api/food/search`

**Query Parameters:**
- `query` (required): Search term (e.g., "apple", "chicken breast")
- `pageSize` (optional): Number of results per page (default: 25, max: 200)
- `pageNumber` (optional): Page number (default: 1)

**Example Request:**
```javascript
const response = await fetch('/api/food/search?query=apple&pageSize=10&pageNumber=1');
const data = await response.json();
```

**Example Response:**
```json
{
  "success": true,
  "query": "apple",
  "totalHits": 1234,
  "currentPage": 1,
  "totalPages": 124,
  "pageSize": "10",
  "foods": [
    {
      "fdcId": 123456,
      "description": "Apple, raw",
      "brandName": null,
      "dataType": "Survey (FNDDS)",
      "servingSize": 100,
      "servingSizeUnit": "g",
      "householdServingFullText": "1 medium apple",
      "nutrients": [...],
      "calories": 52,
      "protein": 0.26,
      "carbs": 13.81,
      "fat": 0.17,
      "fiber": 2.4,
      "sugar": 10.39
    }
  ]
}
```

### Get Food Details

**Endpoint:** `GET /api/food/details`

**Query Parameters:**
- `fdcId` (required): FDC ID of the food item

**Example Request:**
```javascript
const response = await fetch('/api/food/details?fdcId=123456');
const data = await response.json();
```

**Example Response:**
```json
{
  "success": true,
  "food": {
    "fdcId": 123456,
    "description": "Apple, raw",
    "brandName": null,
    "dataType": "Survey (FNDDS)",
    "servingSize": 100,
    "servingSizeUnit": "g",
    "householdServingFullText": "1 medium apple",
    "ingredients": null,
    "nutrients": [...],
    "calories": 52,
    "protein": 0.26,
    "carbs": 13.81,
    "fat": 0.17,
    "fiber": 2.4,
    "sugar": 10.39,
    "sodium": 1,
    "cholesterol": 0
  }
}
```

## Usage in Components

### Search Example

```javascript
import { useState } from 'react';

function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchFood = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/food/search?query=${encodeURIComponent(query)}&pageSize=20`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.foods);
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for food..."
      />
      <button onClick={searchFood} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      <ul>
        {results.map(food => (
          <li key={food.fdcId}>
            {food.description} - {food.calories} cal
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Get Details Example

```javascript
const getFoodDetails = async (fdcId) => {
  try {
    const response = await fetch(`/api/food/details?fdcId=${fdcId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Food details:', data.food);
      return data.food;
    } else {
      console.error('Failed to get details:', data.error);
    }
  } catch (error) {
    console.error('Error fetching details:', error);
  }
};
```

## Key Nutrients Provided

The API automatically extracts and includes these key nutrients:
- **calories**: Energy (kcal)
- **protein**: Protein (g)
- **carbs**: Carbohydrate, by difference (g)
- **fat**: Total lipid (fat) (g)
- **fiber**: Fiber, total dietary (g)
- **sugar**: Sugars, total including NLEA (g)
- **sodium**: Sodium, Na (mg) - details endpoint only
- **cholesterol**: Cholesterol (mg) - details endpoint only

All nutrients are also available in the `nutrients` array with full details.

## USDA Food Data Central

Learn more about the USDA Food Data Central API:
- Documentation: https://fdc.nal.usda.gov/api-guide.html
- Food Data Central: https://fdc.nal.usda.gov/
- API Signup: https://fdc.nal.usda.gov/api-key-signup.html

## Rate Limits

The USDA API has the following rate limits:
- 1,000 requests per hour per API key
- Burst limit of 10 requests per second

Consider implementing caching for frequently searched foods to stay within rate limits.

