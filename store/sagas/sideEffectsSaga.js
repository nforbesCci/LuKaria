import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  saveSideEffectsSuccess, 
  saveSideEffectsFailure, 
  fetchSideEffectsSuccess, 
  fetchSideEffectsFailure 
} from '../slices/sideEffectsSlice';

// API call to save side effects to MongoDB
function* saveSideEffectsToDatabase(sideEffectsData) {
  try {
    const response = yield call(fetch, '/api/side-effects/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sideEffectsData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Side Effects Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving side effects to database:', error);
    throw error;
  }
}

// API call to fetch side effects from MongoDB
function* fetchSideEffectsFromDatabase() {
  try {
    const response = yield call(fetch, '/api/side-effects/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Side Effects Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching side effects from database:', error);
    throw error;
  }
}

// Saga to handle side effects saving
function* saveSideEffectsSaga(action) {
  try {
    console.log('🔄 Side Effects Saga: Starting side effects save...', action.payload);
    
    const result = yield call(saveSideEffectsToDatabase, action.payload);
    
    console.log('✅ Side Effects Saga: Side effects saved successfully', result);
    
    yield put(saveSideEffectsSuccess(result));
  } catch (error) {
    console.error('❌ Side Effects Saga: Error saving side effects', error);
    yield put(saveSideEffectsFailure(error.message));
  }
}

// Saga to handle side effects fetching
function* fetchSideEffectsSaga(action) {
  try {
    console.log('🔄 Side Effects Saga: Starting side effects fetch...');
    
    const result = yield call(fetchSideEffectsFromDatabase);
    
    console.log('✅ Side Effects Saga: Side effects fetched successfully', result);
    
    yield put(fetchSideEffectsSuccess(result));
  } catch (error) {
    console.error('❌ Side Effects Saga: Error fetching side effects', error);
    yield put(fetchSideEffectsFailure(error.message));
  }
}

// Watch for side effects save actions
export function* watchSaveSideEffects() {
  yield takeEvery('sideEffects/saveSideEffects', saveSideEffectsSaga);
}

// Watch for side effects fetch actions
export function* watchFetchSideEffects() {
  yield takeEvery('sideEffects/fetchSideEffects', fetchSideEffectsSaga);
}

export default function* sideEffectsSaga() {
  yield all([
    watchSaveSideEffects(),
    watchFetchSideEffects(),
  ]);
}

