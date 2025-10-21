import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  updatePreAppointmentTaskSuccess, 
  updatePreAppointmentTaskFailure,
  clearAppointmentTasks
} from '../slices/appointmentSlice';

// API call to update pre-appointment task
function* updatePreAppointmentTaskInDatabase(taskData) {
  try {
    const response = yield call(fetch, '/api/pre-appointment-tasks', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Pre-Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error updating pre-appointment task in database:', error);
    throw error;
  }
}

// API call to create pre-appointment task
function* createPreAppointmentTaskInDatabase(taskData) {
  try {
    const response = yield call(fetch, '/api/pre-appointment-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Pre-Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error creating pre-appointment task in database:', error);
    throw error;
  }
}

// API call to delete pre-appointment tasks
function* deletePreAppointmentTasksInDatabase(taskKey) {
  try {
    const response = yield call(fetch, '/api/pre-appointment-tasks', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskKey }),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Pre-Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error deleting pre-appointment tasks in database:', error);
    throw error;
  }
}

// Saga to handle updating pre-appointment task
function* updatePreAppointmentTaskSaga(action) {
  try {
    const { taskKey, completed, notes, taskData } = action.payload;
    console.log('🔄 Pre-Appointment Tasks Saga: Updating pre-appointment task:', { taskKey, completed });
    
    // Prepare task data for API call
    const apiTaskData = {
      taskKey,
      completed,
      notes: notes || `Pre-appointment task ${taskKey} ${completed ? 'completed' : 'incomplete'}`,
      taskData: taskData || {
        completedAt: completed ? new Date().toISOString() : null,
        source: 'pre_appointment_task'
      }
    };

    // Use PUT to update existing task or create new one
    const result = yield call(updatePreAppointmentTaskInDatabase, apiTaskData);
    
    console.log('✅ Pre-Appointment Tasks Saga: Pre-appointment task updated successfully', result);
    yield put(updatePreAppointmentTaskSuccess(result));
    
  } catch (error) {
    console.error('❌ Pre-Appointment Tasks Saga: Error updating pre-appointment task', error);
    yield put(updatePreAppointmentTaskFailure(error.message));
  }
}

// Saga to handle clearing pre-appointment tasks
function* clearPreAppointmentTasksSaga(action) {
  try {
    const { taskKey } = action.payload || {};
    console.log('🔄 Pre-Appointment Tasks Saga: Clearing pre-appointment tasks:', { taskKey });
    
    // Call API to delete tasks
    const result = yield call(deletePreAppointmentTasksInDatabase, taskKey);
    
    console.log('✅ Pre-Appointment Tasks Saga: Pre-appointment tasks cleared successfully', result);
    
    // Update local state
    yield put(clearAppointmentTasks());
    yield put(updatePreAppointmentTaskSuccess(result));
    
  } catch (error) {
    console.error('❌ Pre-Appointment Tasks Saga: Error clearing pre-appointment tasks', error);
    yield put(updatePreAppointmentTaskFailure(error.message));
  }
}

// Watch for pre-appointment task actions
export function* watchUpdatePreAppointmentTask() {
  yield takeEvery('appointment/updatePreAppointmentTask', updatePreAppointmentTaskSaga);
}

export function* watchClearPreAppointmentTasks() {
  yield takeEvery('appointment/clearPreAppointmentTasks', clearPreAppointmentTasksSaga);
}

export default function* preAppointmentTasksSaga() {
  yield watchUpdatePreAppointmentTask();
  yield watchClearPreAppointmentTasks();
}

