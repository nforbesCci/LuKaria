import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminMealsSuccess, 
  fetchAdminMealsFailure 
} from '../slices/adminSlice';

// API call to fetch meals for a specific user (admin function)
function* fetchAdminMealsFromDatabase(userId, options = {}) {
  try {
    const { daysBack = 28, startDate, endDate } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    } else {
      params.append('daysBack', daysBack);
    }
    
    const response = yield call(fetch, `/api/admin/meals/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Meals Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin meals from database:', error);
    throw error;
  }
}

// Saga to handle admin meals fetching
function* fetchAdminMealsSaga(action) {
  try {
    const { userId, daysBack = 28, startDate, endDate } = action.payload;
    console.log('🔄 Admin Meals Saga: Starting meals fetch for user:', userId, startDate && endDate ? `from ${startDate} to ${endDate}` : `for last ${daysBack} days`);
    
    const result = yield call(fetchAdminMealsFromDatabase, userId, { daysBack, startDate, endDate });
    
    console.log('✅ Admin Meals Saga: Meals fetched successfully', result);
    console.log('📊 Saga received meals data:', {
      mealsKeys: result.meals ? Object.keys(result.meals) : 'no meals',
      mealsSample: result.meals ? JSON.stringify(result.meals, null, 2) : 'no meals'
    });
    
    console.log('📤 Saga dispatching fetchAdminMealsSuccess with:', {
      userId,
      mealsKeys: result.meals ? Object.keys(result.meals) : 'no meals',
      mealsSample: result.meals ? JSON.stringify(result.meals, null, 2) : 'no meals',
      dateRange: result.dateRange
    });
    
    yield put(fetchAdminMealsSuccess({
      userId,
      meals: result.meals,
      dateRange: result.dateRange
    }));
  } catch (error) {
    console.error('❌ Admin Meals Saga: Error fetching meals', error);
    yield put(fetchAdminMealsFailure(error.message));
  }
}

// Watch for admin meals fetch actions
export function* watchFetchAdminMeals() {
  yield takeEvery('admin/fetchAdminMeals', fetchAdminMealsSaga);
}

export default function* adminMealsSaga() {
  yield watchFetchAdminMeals();
}
