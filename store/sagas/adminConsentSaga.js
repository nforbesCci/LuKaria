import { call, put, takeEvery, all } from 'redux-saga/effects';
import { 
  fetchAdminConsentFormsSuccess, 
  fetchAdminConsentFormsFailure,
  updateAdminConsentFormSuccess,
  updateAdminConsentFormFailure,
  fetchAdminConsentFormsAction
} from '../slices/adminSlice';
import { updatePreAppointmentTaskSuccess, updatePreAppointmentTaskFailure } from '../slices/appointmentSlice';

// API call to fetch consent forms for a specific user (admin function)
function* fetchAdminConsentFormsFromDatabase(userId) {
  try {
    const response = yield call(fetch, `/api/admin/consent-forms/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin consent forms from database:', error);
    throw error;
  }
}

// API call to update consent form for a specific user (admin function)
function* updateAdminConsentFormInDatabase(userId, formType, updates) {
  try {
    const response = yield call(fetch, `/api/admin/consent-forms/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formType,
        ...updates
      }),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error updating admin consent form in database:', error);
    throw error;
  }
}

// Saga to handle admin consent forms fetching
function* fetchAdminConsentFormsSaga(action) {
  try {
    const { userId } = action.payload;
    console.log('🔄 Admin Consent Saga: Starting consent forms fetch for user:', userId);
    
    const result = yield call(fetchAdminConsentFormsFromDatabase, userId);
    
    console.log('✅ Admin Consent Saga: Consent forms fetched successfully', result);
    console.log('📊 Admin Consent Saga: Consent forms data:', result.consentForms);
    
    yield put(fetchAdminConsentFormsSuccess({
      userId,
      consentForms: result.consentForms
    }));
    
    console.log('✅ Admin Consent Saga: Success action dispatched');
  } catch (error) {
    console.error('❌ Admin Consent Saga: Error fetching consent forms', error);
    yield put(fetchAdminConsentFormsFailure(error.message));
  }
}

// Saga to handle admin consent form updates
function* updateAdminConsentFormSaga(action) {
  try {
    const { userId, formType, updates } = action.payload;
    console.log('🔄 Admin Consent Saga: Starting consent form update for user:', userId, 'formType:', formType, 'updates:', updates);
    
    const result = yield call(updateAdminConsentFormInDatabase, userId, formType, updates);
    
    console.log('✅ Admin Consent Saga: Consent form updated successfully', result);
    
    yield put(updateAdminConsentFormSuccess({
      userId,
      formType,
      updates: result
    }));

    // Refetch consent forms to get the latest data from server
    console.log('🔄 Admin Consent Saga: Refetching consent forms after update for userId:', userId);
    yield put(fetchAdminConsentFormsAction({ userId }));
    console.log('✅ Admin Consent Saga: Refetch action dispatched');
  } catch (error) {
    console.error('❌ Admin Consent Saga: Error updating consent form', error);
    yield put(updateAdminConsentFormFailure(error.message));
  }
}

// API call to update pre-appointment task in database
function* updateAdminPreAppointmentTaskInDatabase(userId, taskKey, completed) {
  try {
    console.log('🔧 Admin Consent Saga: Updating pre-appointment task in database', { userId, taskKey, completed });
    
    const response = yield call(fetch, `/api/admin/pre-appointment-tasks/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        taskKey,
        completed
      }),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Consent Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    console.log('✅ Admin Consent Saga: Pre-appointment task updated successfully', result);
    return result;
  } catch (error) {
    console.error('❌ Admin Consent Saga: Error updating pre-appointment task in database:', error);
    throw error;
  }
}

// Saga to handle admin pre-appointment task updates
function* updateAdminPreAppointmentTaskSaga(action) {
  try {
    const { userId, taskKey, completed } = action.payload;
    console.log('🔄 Admin Consent Saga: Starting pre-appointment task update for user:', userId, 'taskKey:', taskKey, 'completed:', completed);
    
    const result = yield call(updateAdminPreAppointmentTaskInDatabase, userId, taskKey, completed);
    
    console.log('✅ Admin Consent Saga: Pre-appointment task updated successfully', result);
    
    yield put(updatePreAppointmentTaskSuccess({
      userId,
      taskKey,
      completed,
      result
    }));
  } catch (error) {
    console.error('❌ Admin Consent Saga: Error updating pre-appointment task', error);
    yield put(updatePreAppointmentTaskFailure(error.message));
  }
}

// Watch for admin consent forms actions
export function* watchFetchAdminConsentForms() {
  console.log('🔧 Admin Consent Saga: Setting up fetch watcher');
  yield takeEvery('admin/fetchAdminConsentForms', fetchAdminConsentFormsSaga);
}

export function* watchUpdateAdminConsentForm() {
  console.log('🔧 Admin Consent Saga: Setting up update watcher');
  yield takeEvery('admin/updateAdminConsentForm', updateAdminConsentFormSaga);
}

export function* watchUpdateAdminPreAppointmentTask() {
  console.log('🔧 Admin Consent Saga: Setting up pre-appointment task watcher');
  yield takeEvery('admin/updateAdminPreAppointmentTask', updateAdminPreAppointmentTaskSaga);
}

export default function* adminConsentSaga() {
  console.log('🔧 Admin Consent Saga: Starting saga setup');
  yield all([
    watchFetchAdminConsentForms(),
    watchUpdateAdminConsentForm(),
    watchUpdateAdminPreAppointmentTask(),
  ]);
  console.log('🔧 Admin Consent Saga: All watchers set up');
}
