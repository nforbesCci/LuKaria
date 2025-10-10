import { call, put, takeEvery, all } from 'redux-saga/effects';
import { saveProfileSuccess, saveProfileFailure, fetchProfileSuccess, fetchProfileFailure } from '../slices/profileSlice';

// API call to save profile to MongoDB
function* saveProfileToDatabase(profileData) {
  try {
    const response = yield call(fetch, '/api/profile/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Profile Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error saving profile to database:', error);
    throw error;
  }
}

// API call to fetch profile from MongoDB
function* fetchProfileFromDatabase() {
  try {
    const response = yield call(fetch, '/api/profile/fetch', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Profile Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching profile from database:', error);
    throw error;
  }
}

// Saga to handle profile saving
function* saveProfileSaga(action) {
  try {
    console.log('🔄 Profile Saga: Starting profile save...', action.payload);
    
    const result = yield call(saveProfileToDatabase, action.payload);
    
    console.log('✅ Profile Saga: Profile saved successfully', result);
    
    yield put(saveProfileSuccess(result));
  } catch (error) {
    console.error('❌ Profile Saga: Error saving profile', error);
    yield put(saveProfileFailure(error.message));
  }
}

// Saga to handle profile fetching
function* fetchProfileSaga(action) {
  try {
    console.log('🔄 Profile Saga: Starting profile fetch...');
    
    const result = yield call(fetchProfileFromDatabase);
    
    console.log('✅ Profile Saga: Profile fetched successfully');
    console.log('📋 Profile Saga: Full result:', result);
    console.log('📋 Profile Saga: Profile data:', result.profile);
    console.log('📋 Profile Saga: user_metadata:', result.profile?.user_metadata);
    console.log('📋 Profile Saga: consultationOccurred:', result.profile?.user_metadata?.consultationOccurred);
    
    yield put(fetchProfileSuccess(result.profile));
  } catch (error) {
    console.error('❌ Profile Saga: Error fetching profile', error);
    yield put(fetchProfileFailure(error.message));
  }
}

// Watch for profile save actions
export function* watchSaveProfile() {
  yield takeEvery('profile/saveProfile', saveProfileSaga);
}

// Watch for profile fetch actions
export function* watchFetchProfile() {
  yield takeEvery('profile/fetchProfile', fetchProfileSaga);
}

export default function* profileSaga() {
  yield all([
    watchSaveProfile(),
    watchFetchProfile(),
  ]);
}
