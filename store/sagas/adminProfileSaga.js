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
    }));

    
  } catch (error) {
    console.error('❌ Admin Profile Saga: Error fetching profile', error);
    yield put(fetchAdminProfileFailure(error.message));
  }
}


// Watch for admin profile actions
export function* watchFetchAdminProfile() {
  yield takeEvery('admin/fetchAdminProfile', fetchAdminProfileSaga);
}

export default function* adminProfileSaga() {
  yield watchFetchAdminProfile();
}
