import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  setCurrentAppointment,
  setScheduleCompleted,
  addAppointment,
  setBookingStatus,
  setBookingError,
} from '../slices/appointmentSlice';
import { checkAppointmentConfiguration, getAppointmentDetails } from '../../lib/api/appointmentService';

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

// Handle checking appointment configuration from server
function* checkAppointmentConfig() {
  try {
    yield put(setBookingStatus(true));
    yield put(setBookingError(null));
    
    // Call the API to check appointment configuration
    const response = yield call(checkAppointmentConfiguration);
    
    if (response.success && response.data.isScheduled) {
      // If appointment is scheduled according to server config
      const appointmentData = response.data.appointmentDetails;
      const serverAppointmentData = {
        ...appointmentData,
        scheduledAt: response.data.scheduledAt,
        source: 'server_config',
        checkedAt: response.data.checkedAt
      };
      
      yield put(setCurrentAppointment(serverAppointmentData));
      yield put(setScheduleCompleted(true));
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('appointmentData', JSON.stringify(serverAppointmentData));
        localStorage.setItem('scheduleCompleted', 'true');
      }
      
      console.log('✅ Appointment configuration loaded from server:', serverAppointmentData);
    } else {
      console.log('ℹ️ No appointment scheduled according to server configuration');
    }
    
    yield put(setBookingStatus(false));
    
  } catch (error) {
    console.error('❌ Error checking appointment configuration:', error);
    yield put(setBookingStatus(false));
    yield put(setBookingError(error.message));
  }
}

// Utility function to create delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Watch for appointment actions
export default function* appointmentSaga() {
  yield takeEvery('appointment/bookAppointment', bookAppointment);
  yield takeEvery('appointment/completeSchedule', completeSchedule);
  yield takeEvery('appointment/loadAppointmentData', loadAppointmentData);
  yield takeEvery('appointment/checkAppointmentConfig', checkAppointmentConfig);
}

