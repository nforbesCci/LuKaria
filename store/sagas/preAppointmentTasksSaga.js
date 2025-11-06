import { all, call, put, takeEvery } from 'redux-saga/effects';
import { 
  updatePreAppointmentTaskSuccess, 
  updatePreAppointmentTaskFailure,
  fetchPreAppointmentTasksSuccess,
  fetchPreAppointmentTasksFailure,
  clearAppointmentTasks,
  setPreAppointmentTasksLoading,
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

function* fetchPreAppointmentTasksInDatabase() {
  try {
    const response = yield call(fetch, '/api/pre-appointment-tasks', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Pre-Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }
    const result = yield response.json();
    return result;
  }catch (error) { 
    console.error('Error fetching pre-appointment tasks in database:', error);
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

function* fetchPreAppointmentTasksSaga(action) {
  console.log('🔧 Pre-Appointment Tasks Saga: fetchPreAppointmentTasksSaga called', action);
  try {
    yield put(setPreAppointmentTasksLoading(true));
    console.log('🔧 Pre-Appointment Tasks Saga: Calling fetchPreAppointmentTasksInDatabase...');
    const result = yield call(fetchPreAppointmentTasksInDatabase);
    const doneKeys = new Set(
      result.tasks
        .filter(t => t.completed === true)
        .map(t => t.taskKey)
    );

    const preAppointmentTasks = {
      enterWeightHeight: doneKeys.has('enterWeightHeight') || false,
      completeMedicalProfile: doneKeys.has('completeMedicalProfile') || false,
      prepareQuestions: doneKeys.has('prepareQuestions') || false,
      completeConsentForms: doneKeys.has('completeConsentForms') || false    };

    yield put(fetchPreAppointmentTasksSuccess(preAppointmentTasks));
  } catch (error) {
    console.error('❌ Pre-Appointment Tasks Saga: Error fetching pre-appointment tasks', error);
    yield put(fetchPreAppointmentTasksFailure(error.message));
  } finally {
    yield put(setPreAppointmentTasksLoading(false));
  }
}

export function* watchFetchPreAppointmentTasks() {
  console.log('🔧 Pre-Appointment Tasks Saga: Setting up fetchPreAppointmentTasks watcher');
  yield takeEvery('appointment/fetchPreAppointmentTask', fetchPreAppointmentTasksSaga);
}

// Watch for pre-appointment task actions
export function* watchUpdatePreAppointmentTask() {
  yield takeEvery('appointment/updatePreAppointmentTask', updatePreAppointmentTaskSaga);
}

export function* watchClearPreAppointmentTasks() {
  yield takeEvery('appointment/clearPreAppointmentTasks', clearPreAppointmentTasksSaga);
}

export default function* preAppointmentTasksSaga() {
 console.log('🔧 Pre-Appointment Tasks Saga: Starting saga setup');
 yield all([
  watchUpdatePreAppointmentTask(),
  watchClearPreAppointmentTasks(),
  watchFetchPreAppointmentTasks(),
 ]);
}

