import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminProfileSuccess, 
  fetchAdminProfileFailure,
  checkMedicalProfileTaskSuccess,
  checkMedicalProfileTaskFailure
} from '../slices/adminSlice';

// API call to fetch profile for a specific user (admin function)
function* fetchAdminProfileFromDatabase(userId) {
  try {
    const response = yield call(fetch, `/api/admin/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Profile Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin profile from database:', error);
    throw error;
  }
}

// Saga to handle admin profile fetching
function* fetchAdminProfileSaga(action) {
  try {
    const { userId } = action.payload;
    console.log('🔄 Admin Profile Saga: Starting profile fetch for user:', userId);
    
    const result = yield call(fetchAdminProfileFromDatabase, userId);
    
    console.log('✅ Admin Profile Saga: Profile fetched successfully', result);
    
    yield put(fetchAdminProfileSuccess({
      userId,
      profile: result.profile,
      medicalProfileStatus: result.medicalProfileStatus
    }));

    // If medical profile is completed, trigger task completion check
    if (result.medicalProfileStatus && result.medicalProfileStatus.completed) {
      console.log('🎯 Medical Profile completed, checking task status');
      yield put(checkMedicalProfileTaskSuccess({
        userId,
        completed: true,
        fields: result.medicalProfileStatus.fields
      }));
    } else {
      console.log('⚠️ Medical Profile incomplete, missing fields:', result.medicalProfileStatus?.missingFields);
      yield put(checkMedicalProfileTaskSuccess({
        userId,
        completed: false,
        missingFields: result.medicalProfileStatus?.missingFields || []
      }));
    }
  } catch (error) {
    console.error('❌ Admin Profile Saga: Error fetching profile', error);
    yield put(fetchAdminProfileFailure(error.message));
  }
}

// Saga to handle medical profile task checking
function* checkMedicalProfileTaskSaga(action) {
  try {
    const { userId, completed, fields, missingFields } = action.payload;
    console.log('🔄 Admin Profile Saga: Checking medical profile task for user:', userId, 'completed:', completed);
    
    // Here you could dispatch additional actions to update appointment tasks
    // or other systems based on the medical profile completion status
    
    if (completed) {
      console.log('✅ Medical Profile task completed for user:', userId);
      console.log('📋 Completed fields:', fields);
    } else {
      console.log('⚠️ Medical Profile task incomplete for user:', userId);
      console.log('📋 Missing fields:', missingFields);
    }
    
  } catch (error) {
    console.error('❌ Admin Profile Saga: Error checking medical profile task', error);
    yield put(checkMedicalProfileTaskFailure(error.message));
  }
}

// Watch for admin profile actions
export function* watchFetchAdminProfile() {
  yield takeEvery('admin/fetchAdminProfile', fetchAdminProfileSaga);
}

export function* watchCheckMedicalProfileTask() {
  yield takeEvery('admin/checkMedicalProfileTask', checkMedicalProfileTaskSaga);
}

export default function* adminProfileSaga() {
  yield watchFetchAdminProfile();
  yield watchCheckMedicalProfileTask();
}
