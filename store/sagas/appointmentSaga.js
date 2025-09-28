import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  setCurrentAppointment,
  setScheduleCompleted,
  addAppointment,
  setBookingStatus,
  setBookingError,
} from '../slices/appointmentSlice';

// Handle appointment booking
function* bookAppointment(action) {
  try {
    const appointmentData = action.payload;
    
    yield put(setBookingStatus(true));
    yield put(setBookingError(null));
    
    // Simulate API call for booking
    yield call(delay, 2000);
    
    // Dispatch success actions
    yield put(setCurrentAppointment(appointmentData));
    yield put(setScheduleCompleted(true));
    yield put(addAppointment(appointmentData));
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('appointmentData', JSON.stringify(appointmentData));
      localStorage.setItem('scheduleCompleted', 'true');
    }
    
    yield put(setBookingStatus(false));
    
  } catch (error) {
    yield put(setBookingStatus(false));
    yield put(setBookingError(error.message));
  }
}

// Handle schedule completion
function* completeSchedule(action) {
  try {
    const { appointmentData } = action.payload;
    
    yield put(setCurrentAppointment(appointmentData));
    yield put(setScheduleCompleted(true));
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('appointmentData', JSON.stringify(appointmentData));
      localStorage.setItem('scheduleCompleted', 'true');
    }
    
  } catch (error) {
    console.error('Schedule completion error:', error);
    yield put(setBookingError(error.message));
  }
}

// Handle loading appointment data from localStorage
function* loadAppointmentData() {
  try {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('appointmentData');
      const scheduleCompleted = localStorage.getItem('scheduleCompleted');
      
      if (storedData) {
        const appointmentData = JSON.parse(storedData);
        yield put(setCurrentAppointment(appointmentData));
      }
      
      if (scheduleCompleted === 'true') {
        yield put(setScheduleCompleted(true));
      }
    }
  } catch (error) {
    console.error('Error loading appointment data:', error);
  }
}

// Utility function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Watch for appointment actions
export default function* appointmentSaga() {
  yield takeEvery('appointment/bookAppointment', bookAppointment);
  yield takeEvery('appointment/completeSchedule', completeSchedule);
  yield takeEvery('appointment/loadAppointmentData', loadAppointmentData);
}

