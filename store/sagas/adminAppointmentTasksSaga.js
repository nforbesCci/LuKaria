import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminAppointmentTasksSuccess, 
  fetchAdminAppointmentTasksFailure,
  createAdminAppointmentTaskSuccess,
  createAdminAppointmentTaskFailure,
  updateAdminAppointmentTaskSuccess,
  updateAdminAppointmentTaskFailure
} from '../slices/adminSlice';

// API call to fetch appointment tasks for a specific user (admin function)
function* fetchAdminAppointmentTasksFromDatabase(userId) {
  try {
    const response = yield call(fetch, `/api/admin/appointment-tasks/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error fetching admin appointment tasks from database:', error);
    throw error;
  }
}

// API call to create appointment task for a specific user (admin function)
function* createAdminAppointmentTaskInDatabase(userId, taskData) {
  try {
    const response = yield call(fetch, `/api/admin/appointment-tasks/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error creating admin appointment task in database:', error);
    throw error;
  }
}

// API call to update appointment task for a specific user (admin function)
function* updateAdminAppointmentTaskInDatabase(userId, taskId, updates) {
  try {
    const response = yield call(fetch, `/api/admin/appointment-tasks/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        ...updates
      }),
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    return result;
  } catch (error) {
    console.error('Error updating admin appointment task in database:', error);
    throw error;
  }
}

// Saga to handle admin appointment tasks fetching
function* fetchAdminAppointmentTasksSaga(action) {
  try {
    const { userId } = action.payload;
    console.log('🔄 Admin Appointment Tasks Saga: Starting appointment tasks fetch for user:', userId);
    
    const result = yield call(fetchAdminAppointmentTasksFromDatabase, userId);
    
    console.log('✅ Admin Appointment Tasks Saga: Appointment tasks fetched successfully', result);
    
    yield put(fetchAdminAppointmentTasksSuccess({
      userId,
      appointmentTasks: result.appointmentTasks
    }));
  } catch (error) {
    console.error('❌ Admin Appointment Tasks Saga: Error fetching appointment tasks', error);
    yield put(fetchAdminAppointmentTasksFailure(error.message));
  }
}

// Saga to handle admin appointment task creation
function* createAdminAppointmentTaskSaga(action) {
  try {
    const { userId, taskData } = action.payload;
    console.log('🔄 Admin Appointment Tasks Saga: Starting appointment task creation for user:', userId, 'taskData:', taskData);
    
    const result = yield call(createAdminAppointmentTaskInDatabase, userId, taskData);
    
    console.log('✅ Admin Appointment Tasks Saga: Appointment task created successfully', result);
    
    yield put(createAdminAppointmentTaskSuccess({
      userId,
      task: result.task,
      taskId: result.taskId
    }));
  } catch (error) {
    console.error('❌ Admin Appointment Tasks Saga: Error creating appointment task', error);
    yield put(createAdminAppointmentTaskFailure(error.message));
  }
}

// Saga to handle admin appointment task updates
function* updateAdminAppointmentTaskSaga(action) {
  try {
    const { userId, taskId, updates } = action.payload;
    console.log('🔄 Admin Appointment Tasks Saga: Starting appointment task update for user:', userId, 'taskId:', taskId, 'updates:', updates);
    
    const result = yield call(updateAdminAppointmentTaskInDatabase, userId, taskId, updates);
    
    console.log('✅ Admin Appointment Tasks Saga: Appointment task updated successfully', result);
    
    yield put(updateAdminAppointmentTaskSuccess({
      userId,
      taskId,
      updates: result.updatedFields
    }));
  } catch (error) {
    console.error('❌ Admin Appointment Tasks Saga: Error updating appointment task', error);
    yield put(updateAdminAppointmentTaskFailure(error.message));
  }
}

// Watch for admin appointment tasks actions
export function* watchFetchAdminAppointmentTasks() {
  yield takeEvery('admin/fetchAdminAppointmentTasks', fetchAdminAppointmentTasksSaga);
}

export function* watchCreateAdminAppointmentTask() {
  yield takeEvery('admin/createAdminAppointmentTask', createAdminAppointmentTaskSaga);
}

export function* watchUpdateAdminAppointmentTask() {
  yield takeEvery('admin/updateAdminAppointmentTask', updateAdminAppointmentTaskSaga);
}

export default function* adminAppointmentTasksSaga() {
  yield watchFetchAdminAppointmentTasks();
  yield watchCreateAdminAppointmentTask();
  yield watchUpdateAdminAppointmentTask();
}
