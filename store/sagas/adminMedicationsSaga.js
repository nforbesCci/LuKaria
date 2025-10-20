import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminMedicationsSuccess, 
  fetchAdminMedicationsFailure
} from '../slices/adminSlice';

// API call to fetch medications for a specific user (admin function)
function* fetchAdminMedicationsFromDatabase(userId, options = {}) {
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
    
    const response = yield call(fetch, `/api/admin/medications/${userId}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Medications Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin medications from database:', error);
    throw error;
  }
}

// Saga to handle admin medications fetching
function* fetchAdminMedicationsSaga(action) {
  try {
    const { userId, daysBack = 28, startDate, endDate } = action.payload;
    console.log('🔄 Admin Medications Saga: Starting medications fetch for user:', userId, startDate && endDate ? `from ${startDate} to ${endDate}` : `for last ${daysBack} days`);
    
    const result = yield call(fetchAdminMedicationsFromDatabase, userId, { daysBack, startDate, endDate });
    
    console.log('✅ Admin Medications Saga: Medications fetched successfully', result);
    console.log('📊 Saga received medications data:', {
      medicationsCount: result.medications ? result.medications.length : 0,
      medicationsSample: result.medications ? result.medications.slice(0, 2) : 'no medications'
    });
    
    yield put(fetchAdminMedicationsSuccess({
      userId,
      medications: result.medications,
      dateRange: result.dateRange
    }));
  } catch (error) {
    console.error('❌ Admin Medications Saga: Error fetching medications', error);
    yield put(fetchAdminMedicationsFailure(error.message));
  }
}

// Watch for admin medications actions
export function* watchFetchAdminMedications() {
  yield takeEvery('admin/fetchAdminMedications', fetchAdminMedicationsSaga);
}

export default function* adminMedicationsSaga() {
  yield watchFetchAdminMedications();
}
