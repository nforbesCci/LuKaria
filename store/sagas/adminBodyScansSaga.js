import { call, put, takeEvery } from 'redux-saga/effects';
import {
  fetchAdminBodyScansSuccess,
  fetchAdminBodyScansFailure,
} from '../slices/adminSlice';

function* fetchAdminBodyScansFromDatabase(userId) {
  const response = yield call(fetch, `/api/admin/body-scans/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = yield response.json().catch(() => ({}));
    throw new Error(
      errorData.details || errorData.error || `HTTP error! status: ${response.status}`,
    );
  }

  return yield response.json();
}

function* fetchAdminBodyScansSaga(action) {
  try {
    const { userId } = action.payload;
    const result = yield call(fetchAdminBodyScansFromDatabase, userId);
    yield put(
      fetchAdminBodyScansSuccess({
        userId,
        scans: result.scans || [],
        count: result.count || 0,
      }),
    );
  } catch (error) {
    yield put(fetchAdminBodyScansFailure(error.message));
  }
}

export function* watchFetchAdminBodyScans() {
  yield takeEvery('admin/fetchAdminBodyScans', fetchAdminBodyScansSaga);
}

export default function* adminBodyScansSaga() {
  yield watchFetchAdminBodyScans();
}
