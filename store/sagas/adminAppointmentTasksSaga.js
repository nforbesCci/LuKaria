import { call, put, takeEvery } from 'redux-saga/effects';
import { 
  fetchAdminAppointmentTasksSuccess, 
  fetchAdminAppointmentTasksFailure,
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


// Watch for admin appointment tasks actions
export function* watchFetchAdminAppointmentTasks() {
  yield takeEvery('admin/fetchAdminAppointmentTasks', fetchAdminAppointmentTasksSaga);
}


export default function* adminAppointmentTasksSaga() {
  yield watchFetchAdminAppointmentTasks();

}
