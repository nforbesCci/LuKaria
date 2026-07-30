import { all, fork } from 'redux-saga/effects';
import authSaga from './authSaga';
import appointmentSaga from './appointmentSaga';
import userSaga from './userSaga';
import { adminSaga } from './adminSaga';
import profileSaga from './profileSaga';
import measurementsSaga from './measurementsSaga';
import medicationSaga from './medicationSaga';
import consentSaga from './consentSaga';
import notificationSaga from './notificationSaga';
import mealsSaga from './mealsSaga';
import adminMealsSaga from './adminMealsSaga';
import adminConsentSaga from './adminConsentSaga';
import adminAppointmentTasksSaga from './adminAppointmentTasksSaga';
import adminPreAppointmentTasksSaga from './adminPreAppointmentTasksSaga';
import adminProfileSaga from './adminProfileSaga';
import adminMedicationsSaga from './adminMedicationsSaga';
import adminMeasurementsSaga from './adminMeasurementsSaga';
import adminSideEffectsSaga from './adminSideEffectsSaga';
import adminQuestionsSaga from './adminQuestionsSaga';
import sideEffectsSaga from './sideEffectsSaga';
import { pdfSaga } from './pdfSaga';
import preAppointmentTasksSaga from './preAppointmentTasksSaga';
import bodyScanSaga from './bodyScanSaga';

// Root saga that combines all sagas
export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(appointmentSaga),
    fork(userSaga),
    fork(adminSaga),
    fork(profileSaga),
    fork(measurementsSaga),
    fork(medicationSaga),
    fork(consentSaga),
    fork(notificationSaga),
    fork(mealsSaga),
    fork(adminMealsSaga),
    fork(adminConsentSaga),
    fork(adminAppointmentTasksSaga),
    fork(adminPreAppointmentTasksSaga),
    fork(adminProfileSaga),
    fork(adminMedicationsSaga),
    fork(adminMeasurementsSaga),
    fork(adminSideEffectsSaga),
    fork(adminQuestionsSaga),
    fork(sideEffectsSaga),
    fork(pdfSaga),
    fork(preAppointmentTasksSaga),
    fork(bodyScanSaga),
  ]);
}

