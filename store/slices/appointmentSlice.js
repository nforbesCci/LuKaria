import { createSlice } from '@reduxjs/toolkit';

const createDefaultPreAppointmentTasks = () => ({
  completeMedicalProfile: false,
  prepareQuestions: false,
  completeConsentForms: false,
  enterWeightHeight: false,
  testTechnology: false,
});

const initialState = {
  appointments: [],
  currentAppointment: null,
  isBooking: false,
  isScheduleCompleted: false,
  bookingError: null,
  adminRescheduleSuccess: false,
  preAppointmentTasks: createDefaultPreAppointmentTasks(),
  preAppointmentTasksLoading: false,
  preAppointmentTasksLoaded: false,
  preAppointmentTasksError: null,
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
    fetchPreAppointmentTaskFailure: (state, action) => {
      state.preAppointmentTasks = createDefaultPreAppointmentTasks();
      state.preAppointmentTasksError = action.payload;
      state.preAppointmentTasksLoading = false;
      state.preAppointmentTasksLoaded = true;
    },
    resetPreAppointmentTasks: (state) => {
      state.preAppointmentTasks = createDefaultPreAppointmentTasks();
      state.preAppointmentTasksLoading = false;
      state.preAppointmentTasksLoaded = false;
      state.preAppointmentTasksError = null;
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

    fetchPreAppointmentTasksSuccess: (state, action) => {
      console.log('🔧 Slice: fetchPreAppointmentTasksSuccess called with payload:', action.payload);
      
      // Handle the tasks array from the API
      const tasks = action.payload || [];
      
      // Create a set of completed task keys
     
      
      // Update the preAppointmentTasks state
      state.preAppointmentTasks = action.payload;
      console.log('🔧 Slice: Updated preAppointmentTasks state:', state.preAppointmentTasks);
      state.preAppointmentTasksLoading = false;
      state.preAppointmentTasksLoaded = true;
      state.preAppointmentTasksError = null;
    },
    fetchPreAppointmentTasksFailure: (state, action) => {
      state.preAppointmentTasks = createDefaultPreAppointmentTasks();
      state.preAppointmentTasksError = action.payload;
      state.preAppointmentTasksLoading = false;
      state.preAppointmentTasksLoaded = true;
    },
    updatePreAppointmentTaskSuccess: (state, action) => {
      // Handle successful update of pre-appointment task
      state.preAppointmentTasks = { ...state.preAppointmentTasks, ...action.payload };
      state.preAppointmentTasksLoaded = true;
    },
    updatePreAppointmentTaskFailure: (state, action) => {
      // Handle failed update of pre-appointment task
      state.preAppointmentTasksError = action.payload;
    },   
    setPreAppointmentTasksLoading: (state, action) => {
      state.preAppointmentTasksLoading = action.payload;
      if (action.payload) {
        state.preAppointmentTasksLoaded = false;
        state.preAppointmentTasksError = null;
      }
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
  fetchPreAppointmentTask,
  resetPreAppointmentTasks,
  setQuestions,
  setQuestionsLoading,
  setQuestionsError,
  clearQuestions,
  setAdminRescheduleSuccess,
  updatePreAppointmentTaskSuccess,
  updatePreAppointmentTaskFailure,
  fetchPreAppointmentTasksSuccess,
  fetchPreAppointmentTasksFailure,
  setPreAppointmentTasksLoading,
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

// Action creators for pre-appointment tasks saga
export const fetchPreAppointmentTaskAction = (payload) => ({
  type: 'appointment/fetchPreAppointmentTask',
  payload,
});

export const updatePreAppointmentTaskAction = (payload) => ({
  type: 'appointment/updatePreAppointmentTask',
  payload,
});

export const clearPreAppointmentTasksAction = (payload) => ({
  type: 'appointment/clearPreAppointmentTasks',
  payload,
});



export const clearAppointmentTasks = (payload) => ({
  type: 'appointment/clearAppointmentTasks',
  payload,
});

export default appointmentSlice.reducer;
