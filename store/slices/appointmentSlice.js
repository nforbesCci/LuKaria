import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  currentAppointment: null,
  isBooking: false,
  isScheduleCompleted: false,
  bookingError: null,
  adminRescheduleSuccess: false,
  preAppointmentTasks: {
    completeMedicalProfile: false,
    prepareQuestions: false,
    completeConsentForms: false,
    enterWeightHeight: false,
  },
  questions: {
    questions: '',
    noQuestions: false,
    savedAt: null,
    updatedAt: null,
    isLoading: false,
    error: null,
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
    setQuestions: (state, action) => {
      state.questions.questions = action.payload.questions || '';
      state.questions.noQuestions = action.payload.noQuestions || false;
      state.questions.savedAt = action.payload.savedAt || null;
      state.questions.updatedAt = action.payload.updatedAt || null;
      state.questions.error = null;
    },
    setQuestionsLoading: (state, action) => {
      state.questions.isLoading = action.payload;
    },
    setQuestionsError: (state, action) => {
      state.questions.error = action.payload;
      state.questions.isLoading = false;
    },
    clearQuestions: (state) => {
      state.questions = {
        questions: '',
        noQuestions: false,
        savedAt: null,
        updatedAt: null,
        isLoading: false,
        error: null,
      };
    },
    setAdminRescheduleSuccess: (state, action) => {
      state.adminRescheduleSuccess = action.payload;
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
  setQuestions,
  setQuestionsLoading,
  setQuestionsError,
  clearQuestions,
  setAdminRescheduleSuccess,
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

export const loadQuestions = () => ({
  type: 'appointment/loadQuestions',
});

export const saveQuestions = (questionsData) => ({
  type: 'appointment/saveQuestions',
  payload: questionsData,
});

export const requestReschedule = (appointmentId) => ({
  type: 'appointment/requestReschedule',
  payload: { appointmentId },
});

export const adminRescheduleAppointment = (userId, appointmentData) => ({
  type: 'appointment/adminRescheduleAppointment',
  payload: { userId, appointmentData },
});

export default appointmentSlice.reducer;
