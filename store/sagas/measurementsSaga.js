import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  saveMeasurementsSuccess, 
  saveMeasurementsFailure, 
  fetchMeasurementsSuccess, 
  fetchMeasurementsFailure,
  fetchAllMeasurementsSuccess,
  fetchAllMeasurementsFailure
} from '../slices/measurementsSlice';

// API call to save measurements to MongoDB
function* saveMeasurementsToDatabase(measurementsData) {
  try {
    const response = yield call(fetch, '/api/measurements/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(measurementsData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Measurements Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving measurements to database:', error);
    throw error;
  }
}

// API call to fetch measurements from MongoDB
function* fetchMeasurementsFromDatabase() {
  try {
    const response = yield call(fetch, '/api/measurements/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Measurements Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching measurements from database:', error);
    throw error;
  }
}

// API call to fetch all measurements from MongoDB
function* fetchAllMeasurementsFromDatabase() {
  try {
    const response = yield call(fetch, '/api/measurements/fetchAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Measurements Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching all measurements from database:', error);
    throw error;
  }
}

// Saga to handle measurements saving
function* saveMeasurementsSaga(action) {
  try {
    console.log('🔄 Measurements Saga: Starting measurements save...', action.payload);
    
    const result = yield call(saveMeasurementsToDatabase, action.payload);
    
    console.log('✅ Measurements Saga: Measurements saved successfully', result);
    
    yield put(saveMeasurementsSuccess(result));
  } catch (error) {
    console.error('❌ Measurements Saga: Error saving measurements', error);
    yield put(saveMeasurementsFailure(error.message));
  }
}

// Saga to handle measurements fetching
function* fetchMeasurementsSaga(action) {
  try {
    console.log('🔄 Measurements Saga: Starting measurements fetch...');
    
    const result = yield call(fetchMeasurementsFromDatabase);
    
    console.log('✅ Measurements Saga: Measurements fetched successfully', result);
    
    yield put(fetchMeasurementsSuccess(result));
  } catch (error) {
    console.error('❌ Measurements Saga: Error fetching measurements', error);
    yield put(fetchMeasurementsFailure(error.message));
  }
}

// Saga to handle fetching all measurements
function* fetchAllMeasurementsSaga(action) {
  try {
    console.log('🔄 Measurements Saga: Starting fetch all measurements...');
    
    const result = yield call(fetchAllMeasurementsFromDatabase);
    
    console.log('✅ Measurements Saga: All measurements fetched successfully', {
      count: result.count,
      measurements: result.measurements
    });
    
    yield put(fetchAllMeasurementsSuccess(result.measurements || []));
  } catch (error) {
    console.error('❌ Measurements Saga: Error fetching all measurements', error);
    yield put(fetchAllMeasurementsFailure(error.message));
  }
}

// Watch for measurements save actions
export function* watchSaveMeasurements() {
  yield takeEvery('measurements/saveMeasurements', saveMeasurementsSaga);
}

// Watch for measurements fetch actions
export function* watchFetchMeasurements() {
  yield takeEvery('measurements/fetchMeasurements', fetchMeasurementsSaga);
}

// Watch for fetch all measurements actions
export function* watchFetchAllMeasurements() {
  yield takeEvery('measurements/fetchAllMeasurements', fetchAllMeasurementsSaga);
}

export default function* measurementsSaga() {
  yield all([
    watchSaveMeasurements(),
    watchFetchMeasurements(),
    watchFetchAllMeasurements(),
  ]);
}
