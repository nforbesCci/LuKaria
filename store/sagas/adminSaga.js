import { call, put, takeEvery, select } from 'redux-saga/effects';
import {
  setUsers,
  setTotalUsers,
  setStart,
  setLimit,
  setLength,
  setPaginationData,
  setLoading,
  setError,
} from '../slices/adminSlice';

// Admin API saga
function* fetchUsersSaga() {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    
    // Get current state from store
    const state = yield select();
    const { searchTerm, statusFilter, page, rowsPerPage, sort } = state.admin;
    
    console.log('🔍 Admin Saga: Fetching users with params:', {
      searchTerm,
      statusFilter,
      page,
      rowsPerPage,
      sort
    });
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      per_page: rowsPerPage.toString(),
      sort,
    });
    
    if (searchTerm) {
      queryParams.append('search', searchTerm);
    }
    
    if (statusFilter && statusFilter !== 'all') {
      queryParams.append('status', statusFilter);
    }
    
    const response = yield call(fetch, `/api/admin/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Admin Saga: API response status:', response.status);
    
    const data = yield call([response, 'json']);
    console.log('✅ Admin Saga: Users loaded:', data);
    
    if (!response.ok) {
      throw new Error(data.error || data.details || 'Failed to fetch users');
    }
    
    yield put(setUsers(data.users || []));
    yield put(setPaginationData({
      total: data.total || 0,
      start: data.start || 0,
      limit: data.limit || 10,
      length: data.length || 0,
    }));
    
  } catch (error) {
    console.error('❌ Admin Saga: Error fetching users:', error);
    yield put(setError(error.message));
    yield put(setUsers([]));
    yield put(setPaginationData({
      total: 0,
      start: 0,
      limit: 10,
      length: 0,
    }));
  } finally {
    yield put(setLoading(false));
  }
}

// Update user saga
function* updateUserSaga(action) {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    
    const { userId, updates } = action.payload;
    
    const response = yield call(fetch, '/api/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, updates }),
    });
    
    if (!response.ok) {
      const errorData = yield call([response, 'json']);
      throw new Error(errorData.error || 'Failed to update user');
    }
    
    // Refresh the users list
    yield put({ type: 'admin/fetchUsers' });
    
  } catch (error) {
    console.error('❌ Admin Saga: Error updating user:', error);
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}

// Root admin saga
export function* adminSaga() {
  yield takeEvery('admin/fetchUsers', fetchUsersSaga);
  yield takeEvery('admin/updateUser', updateUserSaga);
}
