import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  isLoading: false,
  error: null,
  lastNotification: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotificationLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setNotificationError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
      state.lastNotification = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.lastNotification = null;
      state.error = null;
    },
    notificationSent: (state, action) => {
      state.lastNotification = action.payload;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setNotificationLoading,
  setNotificationError,
  addNotification,
  setNotifications,
  clearNotifications,
  notificationSent,
} = notificationSlice.actions;

// Action creators for sagas
export const sendNotification = (notificationData) => ({
  type: 'notification/sendNotification',
  payload: notificationData,
});

export const fetchNotifications = () => ({
  type: 'notification/fetchNotifications',
});

export default notificationSlice.reducer;

