import { call, put, takeEvery, all, delay } from 'redux-saga/effects';
import {
  createBodyScanSuccess,
  createBodyScanFailure,
  pollBodyScanSuccess,
  pollBodyScanFailure,
  fetchBodyScansSuccess,
  fetchBodyScansFailure,
  pollBodyScan,
} from '../slices/bodyScanSlice';

function* createBodyScanApi(payload) {
  const response = yield call(fetch, '/api/body-scan/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = yield response.json();
  if (!response.ok) {
    throw new Error(data.error || data.details || `HTTP ${response.status}`);
  }
  return data;
}

function* statusBodyScanApi(measurementId) {
  const response = yield call(
    fetch,
    `/api/body-scan/status?id=${encodeURIComponent(measurementId)}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  );
  const data = yield response.json();
  if (!response.ok) {
    throw new Error(data.error || data.details || `HTTP ${response.status}`);
  }
  return data;
}

function* listBodyScansApi() {
  const response = yield call(fetch, '/api/body-scan/list', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = yield response.json();
  if (!response.ok) {
    throw new Error(data.error || data.details || `HTTP ${response.status}`);
  }
  return data;
}

function* createBodyScanSaga(action) {
  try {
    const result = yield call(createBodyScanApi, action.payload);
    yield put(createBodyScanSuccess(result));
    if (result.measurementId && result.status !== 'successful' && result.status !== 'failed') {
      yield put(pollBodyScan({ measurementId: result.measurementId }));
    }
  } catch (error) {
    yield put(createBodyScanFailure(error.message));
  }
}

function* pollBodyScanSaga(action) {
  const measurementId = action.payload?.measurementId;
  if (!measurementId) {
    yield put(pollBodyScanFailure('Missing measurement id'));
    return;
  }

  try {
    // Poll until terminal status (FitXpress recommends ~4s)
    for (let i = 0; i < 45; i += 1) {
      const result = yield call(statusBodyScanApi, measurementId);
      yield put(pollBodyScanSuccess(result));
      const status = result.status || result.measurement?.status;
      if (status === 'successful' || status === 'failed') {
        return;
      }
      yield delay(4000);
    }
    yield put(pollBodyScanFailure('Timed out waiting for scan results'));
  } catch (error) {
    yield put(pollBodyScanFailure(error.message));
  }
}

function* fetchBodyScansSaga() {
  try {
    const result = yield call(listBodyScansApi);
    yield put(fetchBodyScansSuccess(result.scans || []));
  } catch (error) {
    yield put(fetchBodyScansFailure(error.message));
  }
}

export default function* bodyScanSaga() {
  yield all([
    takeEvery('bodyScan/createBodyScan', createBodyScanSaga),
    takeEvery('bodyScan/pollBodyScan', pollBodyScanSaga),
    takeEvery('bodyScan/fetchBodyScans', fetchBodyScansSaga),
  ]);
}
