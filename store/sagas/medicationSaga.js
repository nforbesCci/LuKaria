import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  saveMedicationSuccess, 
  saveMedicationFailure, 
  fetchMedicationSuccess, 
  fetchMedicationFailure,
  fetchAllMedicationsSuccess,
  fetchAllMedicationsFailure
} from '../slices/medicationSlice';

// API call to save medication to MongoDB
function* saveMedicationToDatabase(medicationData) {
  try {
    const response = yield call(fetch, '/api/medications/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicationData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Medication Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving medication to database:', error);
    throw error;
  }
}

// API call to fetch medication from MongoDB
function* fetchMedicationFromDatabase() {
  try {
    const response = yield call(fetch, '/api/medications/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Medication Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching medication from database:', error);
    throw error;
  }
}

// API call to fetch all medications from MongoDB
function* fetchAllMedicationsFromDatabase() {
  try {
    const response = yield call(fetch, '/api/medications/fetchAll', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Medication Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching all medications from database:', error);
    throw error;
  }
}

// Saga to handle medication saving
function* saveMedicationSaga(action) {
  try {
    console.log('🔄 Medication Saga: Starting medication save...', action.payload);
    
    const result = yield call(saveMedicationToDatabase, action.payload);
    
    console.log('✅ Medication Saga: Medication saved successfully', result);
    
    yield put(saveMedicationSuccess(result));
  } catch (error) {
    console.error('❌ Medication Saga: Error saving medication', error);
    yield put(saveMedicationFailure(error.message));
  }
}

// Saga to handle medication fetching
function* fetchMedicationSaga(action) {
  try {
    console.log('🔄 Medication Saga: Starting medication fetch...');
    
    const result = yield call(fetchMedicationFromDatabase);
    
    console.log('✅ Medication Saga: Medication fetched successfully', result);
    
    yield put(fetchMedicationSuccess(result));
  } catch (error) {
    console.error('❌ Medication Saga: Error fetching medication', error);
    yield put(fetchMedicationFailure(error.message));
  }
}

// Saga to handle fetching all medications
function* fetchAllMedicationsSaga(action) {
  try {
    console.log('🔄 Medication Saga: Starting fetch all medications...');
    
    const result = yield call(fetchAllMedicationsFromDatabase);
    
    console.log('✅ Medication Saga: All medications fetched successfully', {
      count: result.count,
      medications: result.medications
    });
    
    yield put(fetchAllMedicationsSuccess(result.medications || []));
  } catch (error) {
    console.error('❌ Medication Saga: Error fetching all medications', error);
    yield put(fetchAllMedicationsFailure(error.message));
  }
}

// Watch for medication save actions
export function* watchSaveMedication() {
  yield takeEvery('medication/saveMedication', saveMedicationSaga);
}

// Watch for medication fetch actions
export function* watchFetchMedication() {
  yield takeEvery('medication/fetchMedication', fetchMedicationSaga);
}

// Watch for fetch all medications actions
export function* watchFetchAllMedications() {
  yield takeEvery('medication/fetchAllMedications', fetchAllMedicationsSaga);
}

export default function* medicationSaga() {
  yield all([
    watchSaveMedication(),
    watchFetchMedication(),
    watchFetchAllMedications(),
  ]);
}

