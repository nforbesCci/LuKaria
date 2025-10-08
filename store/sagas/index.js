import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import appointmentSaga from './appointmentSaga';
import userSaga from './userSaga';
import { adminSaga } from './adminSaga';
import profileSaga from './profileSaga';
import measurementsSaga from './measurementsSaga';
import consentSaga from './consentSaga';
import notificationSaga from './notificationSaga';

// Root saga that combines all sagas
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(appointmentSaga),
    fork(userSaga),
    fork(adminSaga),
    fork(profileSaga),
    fork(measurementsSaga),
    fork(consentSaga),
    fork(notificationSaga),
  ]);
}

