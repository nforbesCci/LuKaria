import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminPreAppointmentTasksSuccess, 
  fetchAdminPreAppointmentTasksFailure 
} from '../slices/adminSlice';

// API call to fetch admin pre-appointment tasks for a specific user
function* fetchAdminPreAppointmentTasksFromDatabase(userId) {
  try {
    console.log('🔧 Admin Pre-Appointment Tasks Saga: Fetching pre-appointment tasks for user:', userId);
    
    const response = yield call(fetch, `/api/admin/pre-appointment-tasks/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = yield response.json();
      console.error('❌ Admin Pre-Appointment Tasks Saga: API Error Response:', errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.details || errorData.error || 'Unknown error'}`);
    }

    const result = yield response.json();
    console.log('✅ Admin Pre-Appointment Tasks Saga: Pre-appointment tasks fetched successfully', result);
    return result;
  } catch (error) {
    console.error('❌ Admin Pre-Appointment Tasks Saga: Error fetching pre-appointment tasks from database:', error);
    throw error;
  }
}

// Saga to handle admin pre-appointment tasks fetching
function* fetchAdminPreAppointmentTasksSaga(action) {
  try {
    const { userId } = action.payload;
    console.log('🔄 Admin Pre-Appointment Tasks Saga: Starting pre-appointment tasks fetch for user:', userId);
    
    const result = yield call(fetchAdminPreAppointmentTasksFromDatabase, userId);
    
    console.log('✅ Admin Pre-Appointment Tasks Saga: Pre-appointment tasks fetched successfully', result);
    
    yield put(fetchAdminPreAppointmentTasksSuccess(result.tasks));
  } catch (error) {
    console.error('❌ Admin Pre-Appointment Tasks Saga: Error fetching pre-appointment tasks', error);
    yield put(fetchAdminPreAppointmentTasksFailure(error.message));
  }
}

// Watch for admin pre-appointment tasks actions
export function* watchFetchAdminPreAppointmentTasks() {
  console.log('🔧 Admin Pre-Appointment Tasks Saga: Setting up fetch watcher');
  yield takeEvery('admin/fetchAdminPreAppointmentTasks', fetchAdminPreAppointmentTasksSaga);
}

export default function* adminPreAppointmentTasksSaga() {
  console.log('🔧 Admin Pre-Appointment Tasks Saga: Starting saga setup');
  yield watchFetchAdminPreAppointmentTasks();
  console.log('🔧 Admin Pre-Appointment Tasks Saga: All watchers set up');
}