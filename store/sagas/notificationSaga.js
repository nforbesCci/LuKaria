import { call, put, takeLatest, all } from 'redux-saga/effects';
import {
  setNotificationLoading,
  setNotificationError,
  addNotification,
  setNotifications,
  notificationSent,
} from '../slices/notificationSlice';

// API call to send notification
async function sendNotificationToDatabase(notificationData) {
  console.log('📤 API: Sending notification to database:', notificationData);
  const response = await fetch('/api/notifications/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notificationData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to send notification');
  }

  return response.json();
}

// API call to fetch notifications
async function fetchNotificationsFromDatabase() {
  console.log('📥 API: Fetching notifications from database');
  const response = await fetch('/api/notifications/fetch');

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch notifications');
  }

  return response.json();
}

// Saga to send notification
function* sendNotificationSaga(action) {
  try {
    console.log('🔔 Saga: Sending notification:', action.payload);
    yield put(setNotificationLoading(true));
    
    const result = yield call(sendNotificationToDatabase, action.payload);
    
    console.log('✅ Saga: Notification sent successfully:', result);
    yield put(notificationSent(result.notification));
    yield put(addNotification(result.notification));
  } catch (error) {
    console.error('❌ Saga: Error sending notification:', error);
    yield put(setNotificationError(error.message));
  }
}

// Saga to fetch notifications
function* fetchNotificationsSaga() {
  try {
    console.log('📥 Saga: Fetching notifications');
    yield put(setNotificationLoading(true));
    
    const result = yield call(fetchNotificationsFromDatabase);
    
    console.log('✅ Saga: Notifications fetched successfully:', result);
    yield put(setNotifications(result.notifications || []));
  } catch (error) {
    console.error('❌ Saga: Error fetching notifications:', error);
    yield put(setNotificationError(error.message));
  }
}

// Watchers
function* watchSendNotification() {
  yield takeLatest('notification/sendNotification', sendNotificationSaga);
}

function* watchFetchNotifications() {
  yield takeLatest('notification/fetchNotifications', fetchNotificationsSaga);
}

// Root notification saga
export default function* notificationSaga() {
  yield all([
    watchSendNotification(),
    watchFetchNotifications(),
  ]);
}

