import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  savePhotographConsentSuccess, 
  savePhotographConsentFailure,
  fetchPhotographConsentSuccess,
  fetchPhotographConsentFailure,
  saveMounjaroConsentSuccess,
  saveMounjaroConsentFailure,
  fetchMounjaroConsentSuccess,
  fetchMounjaroConsentFailure,
  saveSemaglutideConsentSuccess,
  saveSemaglutideConsentFailure,
  fetchSemaglutideConsentSuccess,
  fetchSemaglutideConsentFailure,
  saveTelehealthConsentSuccess,
  saveTelehealthConsentFailure,
  fetchTelehealthConsentSuccess,
  fetchTelehealthConsentFailure
} from '../slices/consentSlice';

// API call to save photograph consent to MongoDB
function* savePhotographConsentToDatabase(consentData) {
  try {
    const response = yield call(fetch, '/api/consent/photograph/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consentData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving photograph consent to database:', error);
    throw error;
  }
}

// API call to fetch photograph consent from MongoDB
function* fetchPhotographConsentFromDatabase() {
  try {
    const response = yield call(fetch, '/api/consent/photograph/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching photograph consent from database:', error);
    throw error;
  }
}

// Saga to handle photograph consent saving
function* savePhotographConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting photograph consent save...', action.payload);
    
    const result = yield call(savePhotographConsentToDatabase, action.payload);
    
    console.log('✅ Consent Saga: Photograph consent saved successfully', result);
    
    yield put(savePhotographConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error saving photograph consent', error);
    yield put(savePhotographConsentFailure(error.message));
  }
}

// Saga to handle photograph consent fetching
function* fetchPhotographConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting photograph consent fetch...');
    
    const result = yield call(fetchPhotographConsentFromDatabase);
    
    console.log('✅ Consent Saga: Photograph consent fetched successfully');
    console.log('Result structure:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : []
    });
    
    yield put(fetchPhotographConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error fetching photograph consent', error);
    yield put(fetchPhotographConsentFailure(error.message));
  }
}

// Watch for photograph consent save actions
export function* watchSavePhotographConsent() {
  yield takeEvery('consent/savePhotographConsent', savePhotographConsentSaga);
}

// Watch for photograph consent fetch actions
export function* watchFetchPhotographConsent() {
  yield takeEvery('consent/fetchPhotographConsent', fetchPhotographConsentSaga);
}

// API call to save mounjaro consent to MongoDB
function* saveMounjaroConsentToDatabase(consentData) {
  try {
    const response = yield call(fetch, '/api/consent/mounjaro/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consentData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving mounjaro consent to database:', error);
    throw error;
  }
}

// Saga to handle mounjaro consent saving
function* saveMounjaroConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting mounjaro consent save...', action.payload);
    
    const result = yield call(saveMounjaroConsentToDatabase, action.payload);
    
    console.log('✅ Consent Saga: Mounjaro consent saved successfully', result);
    
    yield put(saveMounjaroConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error saving mounjaro consent', error);
    yield put(saveMounjaroConsentFailure(error.message));
  }
}

// Watch for mounjaro consent save actions
export function* watchSaveMounjaroConsent() {
  yield takeEvery('consent/saveMounjaroConsent', saveMounjaroConsentSaga);
}

// API call to fetch mounjaro consent from MongoDB
function* fetchMounjaroConsentFromDatabase() {
  try {
    const response = yield call(fetch, '/api/consent/mounjaro/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching mounjaro consent from database:', error);
    throw error;
  }
}

// Saga to handle mounjaro consent fetching
function* fetchMounjaroConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting mounjaro consent fetch...');
    
    const result = yield call(fetchMounjaroConsentFromDatabase);
    
    console.log('✅ Consent Saga: Mounjaro consent fetched successfully');
    console.log('Result structure:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : []
    });
    
    yield put(fetchMounjaroConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error fetching mounjaro consent', error);
    yield put(fetchMounjaroConsentFailure(error.message));
  }
}

// Watch for mounjaro consent fetch actions
export function* watchFetchMounjaroConsent() {
  yield takeEvery('consent/fetchMounjaroConsent', fetchMounjaroConsentSaga);
}

// API call to save semaglutide consent to MongoDB
function* saveSemaglutideConsentToDatabase(consentData) {
  try {
    const response = yield call(fetch, '/api/consent/semaglutide/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consentData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving semaglutide consent to database:', error);
    throw error;
  }
}

// Saga to handle semaglutide consent saving
function* saveSemaglutideConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting semaglutide consent save...', action.payload);
    
    const result = yield call(saveSemaglutideConsentToDatabase, action.payload);
    
    console.log('✅ Consent Saga: Semaglutide consent saved successfully', result);
    
    yield put(saveSemaglutideConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error saving semaglutide consent', error);
    yield put(saveSemaglutideConsentFailure(error.message));
  }
}

// Watch for semaglutide consent save actions
export function* watchSaveSemaglutideConsent() {
  yield takeEvery('consent/saveSemaglutideConsent', saveSemaglutideConsentSaga);
}

// API call to fetch semaglutide consent from MongoDB
function* fetchSemaglutideConsentFromDatabase() {
  try {
    const response = yield call(fetch, '/api/consent/semaglutide/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching semaglutide consent from database:', error);
    throw error;
  }
}

// Saga to handle semaglutide consent fetching
function* fetchSemaglutideConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting semaglutide consent fetch...');
    
    const result = yield call(fetchSemaglutideConsentFromDatabase);
    
    console.log('✅ Consent Saga: Semaglutide consent fetched successfully');
    console.log('Result structure:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : []
    });
    
    yield put(fetchSemaglutideConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error fetching semaglutide consent', error);
    yield put(fetchSemaglutideConsentFailure(error.message));
  }
}

// Watch for semaglutide consent fetch actions
export function* watchFetchSemaglutideConsent() {
  yield takeEvery('consent/fetchSemaglutideConsent', fetchSemaglutideConsentSaga);
}

// API call to save telehealth consent to MongoDB
function* saveTelehealthConsentToDatabase(consentData) {
  try {
    const response = yield call(fetch, '/api/consent/telehealth/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consentData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving telehealth consent to database:', error);
    throw error;
  }
}

// Saga to handle telehealth consent saving
function* saveTelehealthConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting telehealth consent save...', action.payload);
    
    const result = yield call(saveTelehealthConsentToDatabase, action.payload);
    
    console.log('✅ Consent Saga: Telehealth consent saved successfully', result);
    
    yield put(saveTelehealthConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error saving telehealth consent', error);
    yield put(saveTelehealthConsentFailure(error.message));
  }
}

// Watch for telehealth consent save actions
export function* watchSaveTelehealthConsent() {
  yield takeEvery('consent/saveTelehealthConsent', saveTelehealthConsentSaga);
}

// API call to fetch telehealth consent from MongoDB
function* fetchTelehealthConsentFromDatabase() {
  try {
    const response = yield call(fetch, '/api/consent/telehealth/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching telehealth consent from database:', error);
    throw error;
  }
}

// Saga to handle telehealth consent fetching
function* fetchTelehealthConsentSaga(action) {
  try {
    console.log('🔄 Consent Saga: Starting telehealth consent fetch...');
    
    const result = yield call(fetchTelehealthConsentFromDatabase);
    
    console.log('✅ Consent Saga: Telehealth consent fetched successfully');
    console.log('Result structure:', {
      success: result.success,
      hasData: !!result.data,
      dataKeys: result.data ? Object.keys(result.data) : []
    });
    
    yield put(fetchTelehealthConsentSuccess(result.data));
  } catch (error) {
    console.error('❌ Consent Saga: Error fetching telehealth consent', error);
    yield put(fetchTelehealthConsentFailure(error.message));
  }
}

// Watch for telehealth consent fetch actions
export function* watchFetchTelehealthConsent() {
  yield takeEvery('consent/fetchTelehealthConsent', fetchTelehealthConsentSaga);
}

export default function* consentSaga() {
  yield all([
    watchSavePhotographConsent(),
    watchFetchPhotographConsent(),
    watchSaveMounjaroConsent(),
    watchFetchMounjaroConsent(),
    watchSaveSemaglutideConsent(),
    watchFetchSemaglutideConsent(),
    watchSaveTelehealthConsent(),
    watchFetchTelehealthConsent(),
  ]);
}

