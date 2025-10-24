import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // User list data
  users: [],
  totalUsers: 0,
  start: 0,
  limit: 10,
  length: 0,
  loading: false,
  error: null,
  
  // Pagination and filtering
  searchTerm: '',
  statusFilter: 'all',
  page: 0,
  rowsPerPage: 10,
  sort: 'created_at:1',
  
  // UI state
  selectedUser: null,
  editDialogOpen: false,
  
  // Admin meals data
  adminMeals: {},
  adminMealsLoading: false,
  adminMealsError: null,
  
  // Admin consent forms data
  adminConsentForms: {},
  adminConsentFormsLoading: false,
  adminConsentFormsError: null,
  
  // Admin appointment tasks data
  adminAppointmentTasks: [],
  adminAppointmentTasksLoading: false,
  adminAppointmentTasksError: null,
  
  // Admin pre-appointment tasks data
  adminPreAppointmentTasks: [],
  adminPreAppointmentTasksLoading: false,
  adminPreAppointmentTasksError: null,
  
  // Admin profile data
  adminProfile: null,
  adminProfileLoading: false,
  adminProfileError: null,
  medicalProfileStatus: null,
  
  // Admin medications data
  adminMedications: [],
  adminMedicationsLoading: false,
  adminMedicationsError: null,
  
  // Admin measurements data
  adminMeasurements: [],
  adminMeasurementsLoading: false,
  adminMeasurementsError: null,
  
  // Admin side effects data
  adminSideEffects: [],
  adminSideEffectsLoading: false,
  adminSideEffectsError: null,
  
  // Admin questions data
  adminQuestions: [],
  adminQuestionsLoading: false,
  adminQuestionsError: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // User data actions
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setTotalUsers: (state, action) => {
      state.totalUsers = action.payload;
    },
    setStart: (state, action) => {
      state.start = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setLength: (state, action) => {
      state.length = action.payload;
    },
    setPaginationData: (state, action) => {
      const { total, start, limit, length } = action.payload;
      state.totalUsers = total || 0;
      state.start = start || 0;
      state.limit = limit || 10;
      state.length = length || 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Search and filter actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 0; // Reset to first page when searching
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.page = 0; // Reset to first page when filtering
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
      state.page = 0; // Reset to first page when changing rows per page
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    
    // UI actions
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setEditDialogOpen: (state, action) => {
      state.editDialogOpen = action.payload;
    },
    
    // Admin meals actions
    fetchAdminMeals: (state, action) => {
      state.adminMealsLoading = true;
      state.adminMealsError = null;
    },
    fetchAdminMealsSuccess: (state, action) => {
      state.adminMealsLoading = false;
      state.adminMeals = action.payload.meals || {};
      state.adminMealsError = null;
      console.log('🔄 Admin slice: fetchAdminMealsSuccess called with payload:', action.payload);
      console.log('🔄 Admin slice: Setting adminMeals to:', action.payload.meals);
    },
    fetchAdminMealsFailure: (state, action) => {
      state.adminMealsLoading = false;
      state.adminMealsError = action.payload;
    },
    clearAdminMealsError: (state) => {
      state.adminMealsError = null;
    },
    
    // Admin consent forms actions
    fetchAdminConsentForms: (state, action) => {
      state.adminConsentFormsLoading = true;
      state.adminConsentFormsError = null;
    },
    fetchAdminConsentFormsSuccess: (state, action) => {
      state.adminConsentFormsLoading = false;
      state.adminConsentForms = action.payload.consentForms || {};
      state.adminConsentFormsError = null;
    },
    fetchAdminConsentFormsFailure: (state, action) => {
      state.adminConsentFormsLoading = false;
      state.adminConsentFormsError = action.payload;
    },
    updateAdminConsentFormSuccess: (state, action) => {
      // Update the consent form with the result from the API
      const { formType, updates } = action.payload;
      console.log('✅ Admin slice: Consent form updated successfully', formType, updates);
      if (state.adminConsentForms[formType]) {
        state.adminConsentForms[formType] = {
          ...state.adminConsentForms[formType],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    updateAdminConsentFormFailure: (state, action) => {
      // Revert optimistic update on failure
      state.adminConsentFormsError = action.payload;
    },
    clearAdminConsentFormsError: (state) => {
      state.adminConsentFormsError = null;
    },
    
    // Admin appointment tasks actions
    fetchAdminAppointmentTasks: (state, action) => {
      state.adminAppointmentTasksLoading = true;
      state.adminAppointmentTasksError = null;
    },
    fetchAdminAppointmentTasksSuccess: (state, action) => {
      state.adminAppointmentTasksLoading = false;
      state.adminAppointmentTasks = action.payload.appointmentTasks || [];
      state.adminAppointmentTasksError = null;
    },
    fetchAdminAppointmentTasksFailure: (state, action) => {
      state.adminAppointmentTasksLoading = false;
      state.adminAppointmentTasksError = action.payload;
    },
    createAdminAppointmentTask: (state, action) => {
      // Optimistic update - add the new task to the array
      const { task } = action.payload;
      if (task) {
        state.adminAppointmentTasks.unshift(task);
      }
    },
    createAdminAppointmentTaskSuccess: (state, action) => {
      // Confirmation that the task was created successfully
      console.log('✅ Admin slice: Appointment task created successfully');
    },
    createAdminAppointmentTaskFailure: (state, action) => {
      // Revert optimistic update on failure
      state.adminAppointmentTasksError = action.payload;
    },
    updateAdminAppointmentTask: (state, action) => {
      // Optimistic update - update the task in the array
      const { taskId, updates } = action.payload;
      const taskIndex = state.adminAppointmentTasks.findIndex(task => task._id === taskId);
      if (taskIndex !== -1) {
        state.adminAppointmentTasks[taskIndex] = {
          ...state.adminAppointmentTasks[taskIndex],
          ...updates,
          updatedAt: new Date()
        };
      }
    },
    updateAdminAppointmentTaskSuccess: (state, action) => {
      // Confirmation that the update was successful
      console.log('✅ Admin slice: Appointment task updated successfully');
    },
    updateAdminAppointmentTaskFailure: (state, action) => {
      // Revert optimistic update on failure
      state.adminAppointmentTasksError = action.payload;
    },
    clearAdminAppointmentTasksError: (state) => {
      state.adminAppointmentTasksError = null;
    },
    
    // Admin pre-appointment tasks actions
    fetchAdminPreAppointmentTasks: (state, action) => {
      state.adminPreAppointmentTasksLoading = true;
      state.adminPreAppointmentTasksError = null;
    },
    fetchAdminPreAppointmentTasksSuccess: (state, action) => {
      state.adminPreAppointmentTasksLoading = false;
      state.adminPreAppointmentTasks = action.payload.preAppointmentTasks || [];
      state.adminPreAppointmentTasksError = null;
    },
    fetchAdminPreAppointmentTasksFailure: (state, action) => {
      state.adminPreAppointmentTasksLoading = false;
      state.adminPreAppointmentTasksError = action.payload;
    },
    clearAdminPreAppointmentTasksError: (state) => {
      state.adminPreAppointmentTasksError = null;
    },
    
    // Admin profile actions
    fetchAdminProfile: (state, action) => {
      state.adminProfileLoading = true;
      state.adminProfileError = null;
    },
    fetchAdminProfileSuccess: (state, action) => {
      state.adminProfileLoading = false;
      state.adminProfile = action.payload.profile;
      state.medicalProfileStatus = action.payload.medicalProfileStatus;
      state.adminProfileError = null;
    },
    fetchAdminProfileFailure: (state, action) => {
      state.adminProfileLoading = false;
      state.adminProfileError = action.payload;
    },
    checkMedicalProfileTask: (state, action) => {
      // This action is handled by the saga
    },
    checkMedicalProfileTaskSuccess: (state, action) => {
      // Update medical profile status
      if (state.medicalProfileStatus) {
        state.medicalProfileStatus.completed = action.payload.completed;
        if (action.payload.completed) {
          state.medicalProfileStatus.fields = action.payload.fields;
        } else {
          state.medicalProfileStatus.missingFields = action.payload.missingFields;
        }
      }
    },
    checkMedicalProfileTaskFailure: (state, action) => {
      state.adminProfileError = action.payload;
    },
    clearAdminProfileError: (state) => {
      state.adminProfileError = null;
    },
    
    // Admin medications actions
    fetchAdminMedications: (state, action) => {
      state.adminMedicationsLoading = true;
      state.adminMedicationsError = null;
    },
    fetchAdminMedicationsSuccess: (state, action) => {
      state.adminMedicationsLoading = false;
      state.adminMedications = action.payload.medications;
      state.adminMedicationsError = null;
    },
    fetchAdminMedicationsFailure: (state, action) => {
      state.adminMedicationsLoading = false;
      state.adminMedicationsError = action.payload;
    },
    clearAdminMedicationsError: (state) => {
      state.adminMedicationsError = null;
    },
    
    // Admin measurements actions
    fetchAdminMeasurements: (state, action) => {
      state.adminMeasurementsLoading = true;
      state.adminMeasurementsError = null;
    },
    fetchAdminMeasurementsSuccess: (state, action) => {
      state.adminMeasurementsLoading = false;
      state.adminMeasurements = action.payload.measurements;
      state.adminMeasurementsError = null;
    },
    fetchAdminMeasurementsFailure: (state, action) => {
      state.adminMeasurementsLoading = false;
      state.adminMeasurementsError = action.payload;
    },
    clearAdminMeasurementsError: (state) => {
      state.adminMeasurementsError = null;
    },
    
    // Admin side effects actions
    fetchAdminSideEffects: (state, action) => {
      state.adminSideEffectsLoading = true;
      state.adminSideEffectsError = null;
    },
    fetchAdminSideEffectsSuccess: (state, action) => {
      state.adminSideEffectsLoading = false;
      state.adminSideEffects = action.payload.sideEffects;
      state.adminSideEffectsError = null;
    },
    fetchAdminSideEffectsFailure: (state, action) => {
      state.adminSideEffectsLoading = false;
      state.adminSideEffectsError = action.payload;
    },
    clearAdminSideEffectsError: (state) => {
      state.adminSideEffectsError = null;
    },
    updateAdminSideEffect: (state, action) => {
      // This action is handled by the saga
    },
    updateAdminSideEffectSuccess: (state, action) => {
      const { sideEffectId, updates } = action.payload;
      // Update the specific side effect in the list
      const sideEffectIndex = state.adminSideEffects.findIndex(se => se._id === sideEffectId);
      if (sideEffectIndex !== -1) {
        state.adminSideEffects[sideEffectIndex] = {
          ...state.adminSideEffects[sideEffectIndex],
          ...updates
        };
      }
    },
    updateAdminSideEffectFailure: (state, action) => {
      state.adminSideEffectsError = action.payload;
    },
    
    // Admin questions actions
    fetchAdminQuestions: (state, action) => {
      state.adminQuestionsLoading = true;
      state.adminQuestionsError = null;
    },
    fetchAdminQuestionsSuccess: (state, action) => {
      state.adminQuestionsLoading = false;
      state.adminQuestions = action.payload.questions;
      state.adminQuestionsError = null;
    },
    fetchAdminQuestionsFailure: (state, action) => {
      state.adminQuestionsLoading = false;
      state.adminQuestionsError = action.payload;
    },
    clearAdminQuestionsError: (state) => {
      state.adminQuestionsError = null;
    },
    deleteAdminQuestion: (state, action) => {
      // Optimistic update - remove the question from the array
      const { questionId } = action.payload;
      state.adminQuestions = state.adminQuestions.filter(q => q._id !== questionId);
    },
    deleteAdminQuestionSuccess: (state, action) => {
      // Question already removed optimistically
      console.log('✅ Admin Slice: Question deleted successfully', action.payload);
    },
    deleteAdminQuestionFailure: (state, action) => {
      // Revert optimistic update on failure
      state.adminQuestionsError = action.payload;
    },
    
    // Reset actions
    resetFilters: (state) => {
      state.searchTerm = '';
      state.statusFilter = 'all';
      state.page = 0;
      state.sort = 'created_at:1';
    },
    resetAdmin: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setUsers,
  setTotalUsers,
  setStart,
  setLimit,
  setLength,
  setPaginationData,
  setLoading,
  setError,
  clearError,
  setSearchTerm,
  setStatusFilter,
  setPage,
  setRowsPerPage,
  setSort,
  setSelectedUser,
  setEditDialogOpen,
  fetchAdminMeals,
  fetchAdminMealsSuccess,
  fetchAdminMealsFailure,
  clearAdminMealsError,
  fetchAdminConsentForms,
  fetchAdminConsentFormsSuccess,
  fetchAdminConsentFormsFailure,
  updateAdminConsentFormSuccess,
  updateAdminConsentFormFailure,
  clearAdminConsentFormsError,
  fetchAdminAppointmentTasks,
  fetchAdminAppointmentTasksSuccess,
  fetchAdminAppointmentTasksFailure,
  createAdminAppointmentTask,
  createAdminAppointmentTaskSuccess,
  createAdminAppointmentTaskFailure,
  updateAdminAppointmentTask,
  updateAdminAppointmentTaskSuccess,
  updateAdminAppointmentTaskFailure,
  clearAdminAppointmentTasksError,
  fetchAdminPreAppointmentTasks,
  fetchAdminPreAppointmentTasksSuccess,
  fetchAdminPreAppointmentTasksFailure,
  clearAdminPreAppointmentTasksError,
  fetchAdminProfile,
  fetchAdminProfileSuccess,
  fetchAdminProfileFailure,
  checkMedicalProfileTask,
  checkMedicalProfileTaskSuccess,
  checkMedicalProfileTaskFailure,
  clearAdminProfileError,
  fetchAdminMedications,
  fetchAdminMedicationsSuccess,
  fetchAdminMedicationsFailure,
  clearAdminMedicationsError,
  fetchAdminMeasurements,
  fetchAdminMeasurementsSuccess,
  fetchAdminMeasurementsFailure,
  clearAdminMeasurementsError,
  fetchAdminSideEffects,
  fetchAdminSideEffectsSuccess,
  fetchAdminSideEffectsFailure,
  clearAdminSideEffectsError,
  updateAdminSideEffect,
  updateAdminSideEffectSuccess,
  updateAdminSideEffectFailure,
  fetchAdminQuestions,
  fetchAdminQuestionsSuccess,
  fetchAdminQuestionsFailure,
  clearAdminQuestionsError,
  deleteAdminQuestion,
  deleteAdminQuestionSuccess,
  deleteAdminQuestionFailure,
  resetFilters,
  resetAdmin,
} = adminSlice.actions;

// Action creators for sagas
export const fetchUsers = () => ({
  type: 'admin/fetchUsers',
});

export const enableUserAccount = (payload) => ({
  type: 'admin/enableUserAccount',
  payload,
});

export const fetchAdminMealsAction = (payload) => ({
  type: 'admin/fetchAdminMeals',
  payload,
});

export const fetchAdminConsentFormsAction = (payload) => ({
  type: 'admin/fetchAdminConsentForms',
  payload,
});

export const updateAdminConsentFormAction = (payload) => ({
  type: 'admin/updateAdminConsentForm',
  payload,
});

export const fetchAdminAppointmentTasksAction = (payload) => ({
  type: 'admin/fetchAdminAppointmentTasks',
  payload,
});

export const createAdminAppointmentTaskAction = (payload) => ({
  type: 'admin/createAdminAppointmentTask',
  payload,
});

export const updateAdminAppointmentTaskAction = (payload) => ({
  type: 'admin/updateAdminAppointmentTask',
  payload,
});

export const fetchAdminProfileAction = (payload) => ({
  type: 'admin/fetchAdminProfile',
  payload,
});

export const checkMedicalProfileTaskAction = (payload) => ({
  type: 'admin/checkMedicalProfileTask',
  payload,
});

export const fetchAdminMedicationsAction = (payload) => ({
  type: 'admin/fetchAdminMedications',
  payload,
});

export const fetchAdminMeasurementsAction = (payload) => ({
  type: 'admin/fetchAdminMeasurements',
  payload,
});

export const fetchAdminSideEffectsAction = (payload) => ({
  type: 'admin/fetchAdminSideEffects',
  payload,
});

export const updateAdminSideEffectAction = (payload) => ({
  type: 'admin/updateAdminSideEffect',
  payload,
});

export const fetchAdminQuestionsAction = (payload) => ({
  type: 'admin/fetchAdminQuestions',
  payload,
});

export const deleteAdminQuestionAction = (payload) => ({
  type: 'admin/deleteAdminQuestion',
  payload,
});

export default adminSlice.reducer;
