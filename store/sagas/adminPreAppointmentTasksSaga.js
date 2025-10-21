import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminPreAppointmentTasksSuccess, 
  fetchAdminPreAppointmentTasksFailure
} from '../slices/adminSlice';

// API call to fetch pre-appointment tasks for a specific user (admin function)
function* fetchAdminPreAppointmentTasksFromDatabase(userId) {
  try {
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
    return result;
  } catch (error) {
    console.error('Error fetching admin pre-appointment tasks from database:', error);
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
    
    yield put(fetchAdminPreAppointmentTasksSuccess({
      userId,
      preAppointmentTasks: result.preAppointmentTasks || []
    }));
  } catch (error) {
    console.error('❌ Admin Pre-Appointment Tasks Saga: Error fetching pre-appointment tasks', error);
    yield put(fetchAdminPreAppointmentTasksFailure(error.message));
  }
}

// Watch for admin pre-appointment tasks actions
export function* watchFetchAdminPreAppointmentTasks() {
  yield takeEvery('admin/fetchAdminPreAppointmentTasks', fetchAdminPreAppointmentTasksSaga);
}

export default function* adminPreAppointmentTasksSaga() {
  yield watchFetchAdminPreAppointmentTasks();
}

