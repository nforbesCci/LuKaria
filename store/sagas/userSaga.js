import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  setProfile,
  updatePersonalInfo,
  updateHealthInfo,
  updateMedicalHistory,
  updateCurrentMedications,
  updateAllergies,
  setProfileComplete,
  setLoading,
  setError,
} from '../slices/userSlice';

// Handle updating personal information
function* updatePersonalInfoSaga(action) {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    
    const personalData = action.payload;
    
    // Simulate API call
    yield call(delay, 1000);
    
    // Update the profile
    yield put(updatePersonalInfo(personalData));
    
    // Check if profile is complete
    const state = yield select();
    const isComplete = checkProfileCompleteness(state.user.profile, personalData);
    yield put(setProfileComplete(isComplete));
    
    yield put(setLoading(false));
    
  } catch (error) {
    yield put(setLoading(false));
    yield put(setError(error.message));
  }
}

// Handle updating health information
function* updateHealthInfoSaga(action) {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    
    const healthData = action.payload;
    
    // Simulate API call
    yield call(delay, 1000);
    
    // Update the profile
    yield put(updateHealthInfo(healthData));
    
    yield put(setLoading(false));
    
  } catch (error) {
    yield put(setLoading(false));
    yield put(setError(error.message));
  }
}

// Handle loading user profile from database
function* loadUserProfile() {
  try {
    // TODO: Load user profile from database instead of localStorage
    // For now, this is a placeholder
    console.log('Loading user profile from database...');
  } catch (error) {
    console.error('Error loading user profile:', error);
    yield put(setError(error.message));
  }
}

// Helper function to check if profile is complete
function checkProfileCompleteness(profile, newData = {}) {
  const updatedProfile = { ...profile, ...newData };
  
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 
    'dateOfBirth', 'gender', 'address', 'parish'
  ];
  
  return requiredFields.every(field => 
    updatedProfile[field] && updatedProfile[field].toString().trim() !== ''
  );
}

// Utility function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Watch for user actions
export default function* userSaga() {
  yield takeEvery('user/updatePersonalInfo', updatePersonalInfoSaga);
  yield takeEvery('user/updateHealthInfo', updateHealthInfoSaga);
  yield takeEvery('user/loadUserProfile', loadUserProfile);
}

