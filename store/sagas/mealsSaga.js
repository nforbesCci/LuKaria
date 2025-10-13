import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  saveMealsSuccess, 
  saveMealsFailure, 
  fetchMealsSuccess, 
  fetchMealsFailure 
} from '../slices/mealsSlice';

// API call to save meals to MongoDB
function* saveMealsToDatabase(mealsData) {
  try {
    const response = yield call(fetch, '/api/meals/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mealsData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Meals Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving meals to database:', error);
    throw error;
  }
}

// API call to fetch meals from MongoDB
function* fetchMealsFromDatabase(daysBack = 14) {
  try {
    const response = yield call(fetch, `/api/meals/fetch?daysBack=${daysBack}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Meals Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching meals from database:', error);
    throw error;
  }
}

// Saga to handle meals saving
function* saveMealsSaga(action) {
  try {
    console.log('🔄 Meals Saga: Starting meals save...', action.payload);
    
    const result = yield call(saveMealsToDatabase, action.payload);
    
    console.log('✅ Meals Saga: Meals saved successfully', result);
    
    yield put(saveMealsSuccess({
      date: action.payload.date,
      meals: action.payload.meals
    }));
  } catch (error) {
    console.error('❌ Meals Saga: Error saving meals', error);
    yield put(saveMealsFailure(error.message));
  }
}

// Saga to handle meals fetching
function* fetchMealsSaga(action) {
  try {
    const daysBack = action.payload?.daysBack || 14;
    console.log('🔄 Meals Saga: Starting meals fetch for last', daysBack, 'days...');
    
    const result = yield call(fetchMealsFromDatabase, daysBack);
    
    console.log('✅ Meals Saga: Meals fetched successfully', result);
    
    yield put(fetchMealsSuccess(result));
  } catch (error) {
    console.error('❌ Meals Saga: Error fetching meals', error);
    yield put(fetchMealsFailure(error.message));
  }
}

// Watch for meals save actions
export function* watchSaveMeals() {
  yield takeEvery('meals/saveMeals', saveMealsSaga);
}

// Watch for meals fetch actions
export function* watchFetchMeals() {
  yield takeEvery('meals/fetchMeals', fetchMealsSaga);
}

export default function* mealsSaga() {
  yield all([
    watchSaveMeals(),
    watchFetchMeals(),
  ]);
}

