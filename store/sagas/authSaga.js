import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from '../slices/authSlice';

// Simulate API call for login (replace with actual Auth0 integration)
function* loginUser(action) {
  try {
    const { user } = action.payload;
    
    // Simulate API delay
    yield call(delay, 1000);
    
    // For now, we'll just dispatch success with the user data
    // In a real app, you'd make an API call here
    yield put(loginSuccess(user));
    
  } catch (error) {
    yield put(loginFailure(error.message));
  }
}

// Handle logout
function* logoutUser() {
  try {
    // Dispatch logout action
    yield put(logout());
    
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Utility function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Watch for auth actions
export default function* authSaga() {
  yield takeEvery(loginStart.type, loginUser);
  yield takeEvery(logout.type, logoutUser);
}

