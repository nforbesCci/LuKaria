import { call, put, takeEvery, select, all } from 'redux-saga/effects';
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
  console.log('🔧 Admin Saga: fetchUsersSaga called');
  try {
    console.log('🔧 Admin Saga: Setting loading to true');
    yield put(setLoading(true));
    yield put(setError(null));
    
    console.log('🔧 Admin Saga: About to call select()');
    
    // Get current state from store
    const state = yield select();
    const { searchTerm, statusFilter, page, rowsPerPage, sort } = state.admin;
    
    // Ensure pagination values are defined with safe defaults
    const safePage = page ?? 0;
    const safeRowsPerPage = rowsPerPage ?? 10;
    const safeSort = sort ?? 'createdAt';
    
    console.log('🔍 Admin Saga: Fetching users with params:', {
      searchTerm,
      statusFilter,
      page: safePage,
      rowsPerPage: safeRowsPerPage,
      sort: safeSort
    });
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      page: safePage.toString(),
      per_page: safeRowsPerPage.toString(),
      sort: safeSort,
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
    
    console.log('🔧 Admin Saga: About to call response.json()');
    const data = yield call([response, 'json']);
    console.log('✅ Admin Saga: Users loaded:', data);
    
    if (!response.ok) {
      console.error('❌ Admin Saga: API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      // Handle different error cases
      let errorMessage = 'Failed to fetch users';
      if (data && data.error) {
        errorMessage = data.error;
      } else if (data && data.details) {
        errorMessage = data.details;
      } else if (response.status === 500) {
        errorMessage = 'Auth0 Management API configuration error - check your credentials';
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
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
    
    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.message.includes('Auth0')) {
      errorMessage = 'Auth0 Management API is not properly configured. Please check your environment variables.';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Unable to connect to the server. Please check your network connection.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Server error - Auth0 Management API configuration issue.';
    }
    
    yield put(setError(errorMessage));
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

// Enable/Disable user account saga - toggles consultationOccurred
function* enableUserAccountSaga(action) {
  try {
    yield put(setLoading(true));
    yield put(setError(null));
    
    const { userId, consultationOccurred } = action.payload;
    
    console.log(`${consultationOccurred ? '🔓' : '🔒'} Admin Saga: ${consultationOccurred ? 'Enabling' : 'Disabling'} account for user:`, userId);
    console.log('📋 Setting consultationOccurred:', consultationOccurred);
    
    // Call API to update user metadata in Auth0
    const response = yield call(fetch, `/api/admin/users/${userId}/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        consultationOccurred 
      }),
    });
    
    if (!response.ok) {
      const errorData = yield call([response, 'json']);
      throw new Error(errorData.error || 'Failed to enable user account');
    }
    
    const data = yield call([response, 'json']);
    console.log(`✅ Admin Saga: Account ${consultationOccurred ? 'enabled' : 'disabled'} successfully:`, data);
    
    // Optionally refresh the users list
    // yield put({ type: 'admin/fetchUsers' });
    
  } catch (error) {
    console.error('❌ Admin Saga: Error enabling account:', error);
    yield put(setError(error.message));
  } finally {
    yield put(setLoading(false));
  }
}

// Root admin saga
export function* adminSaga() {
  console.log('🔧 Admin Saga: Setting up admin saga watchers');
  yield takeEvery('admin/fetchUsers', fetchUsersSaga);
  yield takeEvery('admin/updateUser', updateUserSaga);
  yield takeEvery('admin/enableUserAccount', enableUserAccountSaga);
  console.log('🔧 Admin Saga: Admin saga watchers set up successfully');
}
