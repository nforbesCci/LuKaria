import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminSideEffectsSuccess, 
  fetchAdminSideEffectsFailure,
  updateAdminSideEffectSuccess,
  updateAdminSideEffectFailure
} from '../slices/adminSlice';

// API call to fetch side effects for a specific user (admin function)
function* fetchAdminSideEffectsFromDatabase(userId, options = {}) {
  try {
    const { limit = 4 } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('limit', limit);
    
    const response = yield call(fetch, `/api/admin/side-effects/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Side Effects Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin side effects from database:', error);
    throw error;
  }
}

// Saga to handle admin side effects fetching
function* fetchAdminSideEffectsSaga(action) {
  try {
    const { userId, limit = 4 } = action.payload;
    console.log('🔄 Admin Side Effects Saga: Starting side effects fetch for user:', userId, `limit: ${limit}`);
    
    const result = yield call(fetchAdminSideEffectsFromDatabase, userId, { limit });
    
    console.log('✅ Admin Side Effects Saga: Side effects fetched successfully', result);
    console.log('📋 Saga received side effects data:', {
      sideEffectsCount: result.sideEffects ? result.sideEffects.length : 0,
      sideEffectsSample: result.sideEffects ? result.sideEffects.slice(0, 2) : 'no side effects'
    });
    
    yield put(fetchAdminSideEffectsSuccess({
      userId,
      sideEffects: result.sideEffects,
      limit: result.limit
    }));
  } catch (error) {
    console.error('❌ Admin Side Effects Saga: Error fetching side effects', error);
    yield put(fetchAdminSideEffectsFailure(error.message));
  }
}

// API call to update side effect (admin function)
function* updateAdminSideEffectFromDatabase(userId, sideEffectId, action, updates) {
  try {
    const response = yield call(fetch, `/api/admin/side-effects/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sideEffectId,
        action,
        updates
      })
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Side Effects Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error updating admin side effect from database:', error);
    throw error;
  }
}

// Saga to handle admin side effect updates
function* updateAdminSideEffectSaga(action) {
  try {
    const { userId, sideEffectId, action: updateAction, updates } = action.payload;
    console.log('🔄 Admin Side Effects Saga: Starting side effect update:', { userId, sideEffectId, updateAction, updates });
    
    const result = yield call(updateAdminSideEffectFromDatabase, userId, sideEffectId, updateAction, updates);
    
    console.log('✅ Admin Side Effects Saga: Side effect updated successfully', result);
    
    yield put(updateAdminSideEffectSuccess({
      sideEffectId,
      action: updateAction,
      updates
    }));
  } catch (error) {
    console.error('❌ Admin Side Effects Saga: Error updating side effect', error);
    yield put(updateAdminSideEffectFailure(error.message));
  }
}

// Watch for admin side effects actions
export function* watchFetchAdminSideEffects() {
  yield takeEvery('admin/fetchAdminSideEffects', fetchAdminSideEffectsSaga);
}

export function* watchUpdateAdminSideEffect() {
  yield takeEvery('admin/updateAdminSideEffect', updateAdminSideEffectSaga);
}

export default function* adminSideEffectsSaga() {
  yield watchFetchAdminSideEffects();
  yield watchUpdateAdminSideEffect();
}
