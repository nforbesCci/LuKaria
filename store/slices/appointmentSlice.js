import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  currentAppointment: null,
  isBooking: false,
  isScheduleCompleted: false,
  bookingError: null,
  preAppointmentTasks: {
    completeMedicalProfile: false,
    prepareQuestions: false,
    testTechnology: false,
    enterWeightHeight: false,
  },
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setScheduleCompleted: (state, action) => {
      state.isScheduleCompleted = action.payload;
    },
    setCurrentAppointment: (state, action) => {
      state.currentAppointment = action.payload;
      if (action.payload) {
        state.isScheduleCompleted = true;
      }
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
      state.currentAppointment = action.payload;
      state.isScheduleCompleted = true;
    },
    setBookingStatus: (state, action) => {
      state.isBooking = action.payload;
    },
    setBookingError: (state, action) => {
      state.bookingError = action.payload;
    },
    clearBookingError: (state) => {
      state.bookingError = null;
    },
    clearAppointments: (state) => {
      state.appointments = [];
      state.currentAppointment = null;
      state.isScheduleCompleted = false;
    },
    updatePreAppointmentTask: (state, action) => {
      const { taskKey, completed } = action.payload;
      if (state.preAppointmentTasks.hasOwnProperty(taskKey)) {
        state.preAppointmentTasks[taskKey] = completed;
      }
    },
    resetPreAppointmentTasks: (state) => {
      state.preAppointmentTasks = {
        completeMedicalProfile: false,
        prepareQuestions: false,
        testTechnology: false,
        enterWeightHeight: false,
      };
    },
  },
});

export const {
  setScheduleCompleted,
  setCurrentAppointment,
  addAppointment,
  setBookingStatus,
  setBookingError,
  clearBookingError,
  clearAppointments,
  updatePreAppointmentTask,
  resetPreAppointmentTasks,
} = appointmentSlice.actions;

// Action creators for sagas
export const bookAppointment = (appointmentData) => ({
  type: 'appointment/bookAppointment',
  payload: appointmentData,
});

export const completeSchedule = (appointmentData) => ({
  type: 'appointment/completeSchedule',
  payload: { appointmentData },
});

export const loadAppointmentData = () => ({
  type: 'appointment/loadAppointmentData',
});

export const checkAppointmentConfig = () => ({
  type: 'appointment/checkAppointmentConfig',
});

export default appointmentSlice.reducer;
