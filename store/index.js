import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authSlice from './slices/authSlice';
import appointmentSlice from './slices/appointmentSlice';
import userSlice from './slices/userSlice';
import adminSlice from './slices/adminSlice';
import profileSlice from './slices/profileSlice';
import measurementsSlice from './slices/measurementsSlice';
import medicationSlice from './slices/medicationSlice';
import consentSlice from './slices/consentSlice';
import notificationSlice from './slices/notificationSlice';
import rootSaga from './sagas';

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    auth: authSlice,
    appointment: appointmentSlice,
    user: userSlice,
    admin: adminSlice,
    profile: profileSlice,
    measurements: measurementsSlice,
    medication: medicationSlice,
    consent: consentSlice,
    notification: notificationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
});

// Run the root saga
sagaMiddleware.run(rootSaga);

// TypeScript types (only needed if using TypeScript)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
