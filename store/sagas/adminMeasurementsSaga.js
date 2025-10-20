import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminMeasurementsSuccess, 
  fetchAdminMeasurementsFailure
} from '../slices/adminSlice';

// API call to fetch measurements for a specific user (admin function)
function* fetchAdminMeasurementsFromDatabase(userId, options = {}) {
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
    
    const response = yield call(fetch, `/api/admin/measurements/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Measurements Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin measurements from database:', error);
    throw error;
  }
}

// Saga to handle admin measurements fetching
function* fetchAdminMeasurementsSaga(action) {
  try {
    const { userId, daysBack = 28, startDate, endDate } = action.payload;
    console.log('🔄 Admin Measurements Saga: Starting measurements fetch for user:', userId, startDate && endDate ? `from ${startDate} to ${endDate}` : `for last ${daysBack} days`);
    
    const result = yield call(fetchAdminMeasurementsFromDatabase, userId, { daysBack, startDate, endDate });
    
    console.log('✅ Admin Measurements Saga: Measurements fetched successfully', result);
    console.log('📊 Saga received measurements data:', {
      measurementsCount: result.measurements ? result.measurements.length : 0,
      measurementsSample: result.measurements ? result.measurements.slice(0, 2) : 'no measurements'
    });
    
    yield put(fetchAdminMeasurementsSuccess({
      userId,
      measurements: result.measurements,
      dateRange: result.dateRange
    }));
  } catch (error) {
    console.error('❌ Admin Measurements Saga: Error fetching measurements', error);
    yield put(fetchAdminMeasurementsFailure(error.message));
  }
}

// Watch for admin measurements actions
export function* watchFetchAdminMeasurements() {
  yield takeEvery('admin/fetchAdminMeasurements', fetchAdminMeasurementsSaga);
}

export default function* adminMeasurementsSaga() {
  yield watchFetchAdminMeasurements();
}
