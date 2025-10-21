import { takeEvery, call, put, select } from 'redux-saga/effects';
import {
  setCurrentAppointment,
  setScheduleCompleted,
  addAppointment,
  setBookingStatus,
  setBookingError,
  setQuestions,
  setQuestionsLoading,
  setQuestionsError,
  clearAppointments,
  setAdminRescheduleSuccess,
} from '../slices/appointmentSlice';
import { sendNotification } from '../slices/notificationSlice';
import { checkAppointmentConfiguration, getAppointmentDetails, saveAppointment } from '../../lib/api/appointmentService';
import { setIsScheduled } from '../slices/userSlice';

// Handle appointment booking
function* bookAppointment(action) {
  try {
    const appointmentData = action.payload;
    
    yield put(setBookingStatus(true));
    yield put(setBookingError(null));
    
    // Call API to save appointment to MongoDB
    const response = yield call(saveAppointment, appointmentData);
    
    if (response.success) {
      console.log('✅ Appointment booked and saved to database:', response.data);
      
      // Dispatch success actions
      yield put(setCurrentAppointment(response.data.appointmentDetails));
      yield put(setScheduleCompleted(true));
      yield put(setIsScheduled(true));
      yield put(addAppointment(response.data.appointmentDetails));
      
      console.log('✅ Appointment booking completed successfully');
    } else {
      throw new Error('Failed to save appointment to database');
    }
    
    yield put(setBookingStatus(false));
    
  } catch (error) {
    console.error('❌ Appointment booking error:', error);
    yield put(setBookingStatus(false));
    yield put(setBookingError(error.message));
  }
}

// Handle schedule completion
function* completeSchedule(action) {
  try {
    const { appointmentData } = action.payload;
    
    yield put(setBookingStatus(true));
    yield put(setBookingError(null));
    
    // Call API to save appointment to MongoDB
    const response = yield call(saveAppointment, appointmentData);
    
    if (response.success) {
      console.log('✅ Appointment saved to database:', response.data);
      
      // Update Redux store with saved data
      yield put(setCurrentAppointment(response.data.appointmentDetails));
      yield put(setScheduleCompleted(true));
      yield put(setIsScheduled(true));
      
      // Update user_metadata.scheduled in Auth0
      try {
        console.log('📝 Updating user_metadata.scheduled in Auth0...');
        const metadataResponse = yield call(fetch, '/api/profile/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_metadata: {
              scheduled: true
            }
          }),
        });
        
        if (metadataResponse.ok) {
          console.log('✅ user_metadata.scheduled updated in Auth0');
        } else {
          console.warn('⚠️ Failed to update user_metadata.scheduled in Auth0');
        }
      } catch (metadataError) {
        console.error('❌ Error updating user_metadata.scheduled:', metadataError);
        // Don't fail the entire operation if metadata update fails
      }
      
      console.log('✅ Schedule completed and saved successfully');
    } else {
      throw new Error('Failed to save appointment to database');
    }
    
    yield put(setBookingStatus(false));
    
  } catch (error) {
    console.error('❌ Schedule completion error:', error);
    yield put(setBookingStatus(false));
    yield put(setBookingError(error.message));
  }
}

// Handle loading appointment data from database
function* loadAppointmentData() {
  try {
    // Load appointment data from database instead of localStorage
    yield call(checkAppointmentConfig);
  } catch (error) {
    console.error('Error loading appointment data:', error);
  }
}

// Handle checking appointment configuration from server
function* checkAppointmentConfig() {
  try {
    console.log('🚀 Saga: checkAppointmentConfig started');
    yield put(setBookingStatus(true));
    yield put(setBookingError(null));
    
    // Call the API to check appointment configuration
    console.log('📞 Calling API: checkAppointmentConfiguration');
    const response = yield call(checkAppointmentConfiguration);
    console.log('📨 API Response received:', response);
    
    if (response.success) {
      if (response.data.isScheduled) {
        // If appointment is scheduled according to server config
        const appointmentData = response.data.appointmentDetails;
        const serverAppointmentData = {
          ...appointmentData,
          scheduledAt: response.data.scheduledAt,
          source: 'server_config',
          checkedAt: response.data.checkedAt,
          rescheduleRequested: response.data.rescheduleRequested,
          rescheduleRequestedAt: response.data.rescheduleRequestedAt
        };
        
        console.log('📋 Setting appointment with reschedule status:', {
          rescheduleRequested: serverAppointmentData.rescheduleRequested,
          rescheduleRequestedAt: serverAppointmentData.rescheduleRequestedAt
        });
        
        yield put(setCurrentAppointment(serverAppointmentData));
        yield put(setScheduleCompleted(true));
        yield put(setIsScheduled(true));
        
        console.log('✅ Appointment IS scheduled - data loaded from server:', serverAppointmentData);
        console.log('🏪 Store updated: isScheduled = true, scheduleCompleted = true');
      } else {
        // No appointment scheduled - set flags to false
        yield put(setCurrentAppointment(null));
        yield put(setScheduleCompleted(false));
        yield put(setIsScheduled(false));
        
        console.log('ℹ️ No appointment scheduled - flags set to false');
        console.log('🏪 Store updated: isScheduled = false, scheduleCompleted = false');
      }
    } else {
      console.log('⚠️ API response was not successful:', response);
    }
    
    yield put(setBookingStatus(false));
    
  } catch (error) {
    console.error('❌ Error checking appointment configuration:', error);
    yield put(setBookingStatus(false));
    yield put(setBookingError(error.message));
  }
}

// Handle loading questions from database
function* loadQuestions() {
  try {
    console.log('🚀 Saga: loadQuestions started');
    yield put(setQuestionsLoading(true));
    yield put(setQuestionsError(null));
    
    // Call the API to load questions
    console.log('📞 Calling API: GET /api/questions/save');
    const response = yield call(fetch, '/api/questions/save');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = yield call([response, 'json']);
    console.log('📨 API Response received:', data);
    
    if (data.success) {
      yield put(setQuestions(data.data));
      console.log('✅ Questions loaded successfully:', data.data);
    } else {
      throw new Error(data.error || 'Failed to load questions');
    }
    
    yield put(setQuestionsLoading(false));
    
  } catch (error) {
    console.error('❌ Error loading questions:', error);
    yield put(setQuestionsLoading(false));
    yield put(setQuestionsError(error.message));
  }
}

// Handle saving questions to database
function* saveQuestions(action) {
  try {
    console.log('🚀 Saga: saveQuestions started');
    const questionsData = action.payload;
    
    yield put(setQuestionsLoading(true));
    yield put(setQuestionsError(null));
    
    // Call the API to save questions
    console.log('📞 Calling API: POST /api/questions/save');
    const response = yield call(fetch, '/api/questions/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(questionsData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = yield call([response, 'json']);
    console.log('📨 API Response received:', data);
    
    if (data.success) {
      yield put(setQuestions(data.data));
      console.log('✅ Questions saved successfully:', data.data);
      
      // Update pre-appointment task for questions preparation
      yield put({
        type: 'appointment/updatePreAppointmentTask',
        payload: {
          taskKey: 'prepareQuestions',
          completed: true,
          notes: 'Questions have been prepared and saved',
          taskData: {
            completedAt: new Date().toISOString(),
            source: 'questions_save'
          }
        }
      });
    } else {
      throw new Error(data.error || 'Failed to save questions');
    }
    
    yield put(setQuestionsLoading(false));
    
  } catch (error) {
    console.error('❌ Error saving questions:', error);
    yield put(setQuestionsLoading(false));
    yield put(setQuestionsError(error.message));
  }
}

// Handle reschedule request
function* requestReschedule(action) {
  try {
    console.log('🔄 Saga: Requesting reschedule for appointment:', action.payload);
    
    const { appointmentId } = action.payload;
    
    // Call API to update appointment status
    console.log('📞 Calling API: POST /api/appointment/reschedule');
    const response = yield call(fetch, '/api/appointment/reschedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointmentId, status: 'request appointment' }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = yield call([response, 'json']);
    console.log('📨 API Response received:', data);
    
    if (data.success) {
      console.log('✅ Appointment reschedule requested successfully');
      
      // Clear current appointment and reset schedule status
      yield put(clearAppointments());
      yield put(setIsScheduled(false));
      
      // Send notification
      console.log('📤 Sending reschedule notification');
      yield put(sendNotification({
        type: 'schedule',
        details: 'request appointment',
        message: 'User has requested to reschedule their appointment',
        timestamp: new Date().toISOString(),
      }));
      
    } else {
      throw new Error(data.error || 'Failed to request reschedule');
    }
    
  } catch (error) {
    console.error('❌ Error requesting reschedule:', error);
    yield put(setBookingError(error.message));
  }
}

// Handle admin reschedule appointment
function* adminRescheduleAppointment(action) {
  try {
    console.log('📅 Saga: Admin rescheduling appointment:', action.payload);
    
    const { userId, appointmentData } = action.payload;
    
    console.log('🔍 Saga: User ID:', userId);
    console.log('🔍 Saga: Appointment Data:', appointmentData);
    
    yield put(setBookingStatus(true));
    yield put(setBookingError(null));
    yield put(setAdminRescheduleSuccess(false));
    
    // Call API to save appointment
    console.log('📞 Calling API: POST /api/appointment/reschedule');
    console.log('📤 Sending payload:', JSON.stringify({ userId, appointmentData }));
    
    const response = yield call(fetch, '/api/appointment/reschedule', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, appointmentData }),
    });
    
    console.log('📨 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = yield call([response, 'text']);
      console.error('❌ API Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }
    
    const data = yield call([response, 'json']);
    console.log('📨 API Response data:', data);
    
    if (data.success) {
      console.log('✅ Admin appointment reschedule successful');
      console.log('💾 Database update result:', data.result);
      yield put(setAdminRescheduleSuccess(true));
    } else {
      throw new Error(data.error || 'Failed to reschedule appointment');
    }
    
    yield put(setBookingStatus(false));
    
  } catch (error) {
    console.error('❌ Error in admin reschedule:', error);
    yield put(setBookingStatus(false));
    yield put(setBookingError(error.message));
    yield put(setAdminRescheduleSuccess(false));
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
  yield takeEvery('appointment/loadQuestions', loadQuestions);
  yield takeEvery('appointment/saveQuestions', saveQuestions);
  yield takeEvery('appointment/requestReschedule', requestReschedule);
  yield takeEvery('appointment/adminRescheduleAppointment', adminRescheduleAppointment);
}

