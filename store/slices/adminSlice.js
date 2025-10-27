import { LensTwoTone } from '@mui/icons-material';
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
  page: 0,
  rowsPerPage: 10,
  searchTerm: '',
  statusFilter: 'all',
  sort: 'createdAt',
  selectedUser: null,
  editDialogOpen: false,
  
  // Enable/disable user account
  enablingAccount: false,
  enableAccountError: null,
  
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
  
  // Admin profile data
  adminProfile: null,
  adminProfileLoading: false,
  adminProfileError: null,
  medicalProfileStatus: false,
  
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
  
  // Admin pre-appointment tasks data
  adminPreAppointmentTasks: [],
  adminPreAppointmentTasksLoading: false,
  adminPreAppointmentTasksError: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // User list reducers
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
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    // Pagination and filtering reducers
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setEditDialogOpen: (state, action) => {
      state.editDialogOpen = action.payload;
    },
    setPaginationData: (state, action) => {
      const { page, length, total, limit, start } = action.payload;
      state.page = page;
      state.start = start,
      state.limit = limit,
      state.rowsPerPage = length;
      state.totalUsers = total;
    },
    resetFilters: (state) => {
      state.searchTerm = '';
      state.statusFilter = 'all';
      state.page = 0;
      state.sort = 'createdAt';
    },
    
    // Enable/disable user account reducers
    enableUserAccount: (state) => {
      state.enablingAccount = true;
      state.enableAccountError = null;
    },
    enableUserAccountSuccess: (state, action) => {
      state.enablingAccount = false;
      state.enableAccountError = null;
    },
    enableUserAccountFailure: (state, action) => {
      state.enablingAccount = false;
      state.enableAccountError = action.payload;
    },
    
    // Admin meals reducers
    fetchAdminMeals: (state) => {
      state.adminMealsLoading = true;
      state.adminMealsError = null;
    },
    fetchAdminMealsSuccess: (state, action) => {
      state.adminMealsLoading = false;
      state.adminMeals = action.payload;
    },
    fetchAdminMealsFailure: (state, action) => {
      state.adminMealsLoading = false;
      state.adminMealsError = action.payload;
    },
    clearAdminMealsError: (state) => {
      state.adminMealsError = null;
    },
    
    // Admin consent forms reducers
    fetchAdminConsentForms: (state) => {
      state.adminConsentFormsLoading = true;
      state.adminConsentFormsError = null;
    },
    fetchAdminConsentFormsSuccess: (state, action) => {
      state.adminConsentFormsLoading = false;
      state.adminConsentForms = action.payload.consentForms || {};
    },
    fetchAdminConsentFormsFailure: (state, action) => {
      state.adminConsentFormsLoading = false;
      state.adminConsentFormsError = action.payload;
    },
    updateAdminConsentForm: (state, action) => {
      const { formType, updates } = action.payload;
      if (state.adminConsentForms[formType]) {
        state.adminConsentForms[formType] = {
          ...state.adminConsentForms[formType],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    updateAdminConsentFormSuccess: (state, action) => {
      const { formType, updates } = action.payload;
      if (state.adminConsentForms[formType]) {
        state.adminConsentForms[formType] = {
          ...state.adminConsentForms[formType],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },
    updateAdminConsentFormFailure: (state, action) => {
      state.adminConsentFormsError = action.payload;
    },
    clearAdminConsentFormsError: (state) => {
      state.adminConsentFormsError = null;
    },
    
    // Admin appointment tasks reducers
    fetchAdminAppointmentTasks: (state) => {
      state.adminAppointmentTasksLoading = true;
      state.adminAppointmentTasksError = null;
    },
    fetchAdminAppointmentTasksSuccess: (state, action) => {
      state.adminAppointmentTasksLoading = false;
      state.adminAppointmentTasks = action.payload;
    },
    fetchAdminAppointmentTasksFailure: (state, action) => {
      state.adminAppointmentTasksLoading = false;
      state.adminAppointmentTasksError = action.payload;
    },
    createAdminAppointmentTask: (state, action) => {
      state.adminAppointmentTasks.push(action.payload);
    },
    updateAdminAppointmentTask: (state, action) => {
      const { taskId, updates } = action.payload;
      const taskIndex = state.adminAppointmentTasks.findIndex(task => task._id === taskId);
      if (taskIndex !== -1) {
        state.adminAppointmentTasks[taskIndex] = {
          ...state.adminAppointmentTasks[taskIndex],
          ...updates
        };
      }
    },
    clearAdminAppointmentTasksError: (state) => {
      state.adminAppointmentTasksError = null;
    },
    
    // Admin profile reducers
    fetchAdminProfile: (state) => {
      state.adminProfileLoading = true;
      state.adminProfileError = null;
    },
    fetchAdminProfileSuccess: (state, action) => {
      state.adminProfileLoading = false;
      state.adminProfile = action.payload;
    },
    fetchAdminProfileFailure: (state, action) => {
      state.adminProfileLoading = false;
      state.adminProfileError = action.payload;
    },
    checkMedicalProfileTask: (state, action) => {
      state.medicalProfileStatus = action.payload;
    },
    checkMedicalProfileTaskSuccess: (state, action) => {
      state.medicalProfileStatus = action.payload;
    },
    checkMedicalProfileTaskFailure: (state, action) => {
      state.adminProfileError = action.payload;
    },
    clearAdminProfileError: (state) => {
      state.adminProfileError = null;
    },
    
    // Admin medications reducers
    fetchAdminMedications: (state) => {
      state.adminMedicationsLoading = true;
      state.adminMedicationsError = null;
    },
    fetchAdminMedicationsSuccess: (state, action) => {
      state.adminMedicationsLoading = false;
      state.adminMedications = action.payload;
    },
    fetchAdminMedicationsFailure: (state, action) => {
      state.adminMedicationsLoading = false;
      state.adminMedicationsError = action.payload;
    },
    updateAdminMedication: (state, action) => {
      const { medicationId, updates } = action.payload;
      const medicationIndex = state.adminMedications.findIndex(med => med._id === medicationId);
      if (medicationIndex !== -1) {
        state.adminMedications[medicationIndex] = {
          ...state.adminMedications[medicationIndex],
          ...updates
        };
      }
    },
    clearAdminMedicationsError: (state) => {
      state.adminMedicationsError = null;
    },
    
    // Admin measurements reducers
    fetchAdminMeasurements: (state) => {
      state.adminMeasurementsLoading = true;
      state.adminMeasurementsError = null;
    },
    fetchAdminMeasurementsSuccess: (state, action) => {
      state.adminMeasurementsLoading = false;
      state.adminMeasurements = action.payload;
    },
    fetchAdminMeasurementsFailure: (state, action) => {
      state.adminMeasurementsLoading = false;
      state.adminMeasurementsError = action.payload;
    },
    updateAdminMeasurement: (state, action) => {
      const { measurementId, updates } = action.payload;
      const measurementIndex = state.adminMeasurements.findIndex(meas => meas._id === measurementId);
      if (measurementIndex !== -1) {
        state.adminMeasurements[measurementIndex] = {
          ...state.adminMeasurements[measurementIndex],
          ...updates
        };
      }
    },
    clearAdminMeasurementsError: (state) => {
      state.adminMeasurementsError = null;
    },
    
    // Admin side effects reducers
    fetchAdminSideEffects: (state) => {
      state.adminSideEffectsLoading = true;
      state.adminSideEffectsError = null;
    },
    fetchAdminSideEffectsSuccess: (state, action) => {
      state.adminSideEffectsLoading = false;
      state.adminSideEffects = action.payload;
    },
    fetchAdminSideEffectsFailure: (state, action) => {
      state.adminSideEffectsLoading = false;
      state.adminSideEffectsError = action.payload;
    },
    updateAdminSideEffect: (state, action) => {
      const { sideEffectId, updates } = action.payload;
      const sideEffectIndex = state.adminSideEffects.findIndex(se => se._id === sideEffectId);
      if (sideEffectIndex !== -1) {
        state.adminSideEffects[sideEffectIndex] = {
          ...state.adminSideEffects[sideEffectIndex],
          ...updates
        };
      }
    },
    updateAdminSideEffectSuccess: (state, action) => {
      const { sideEffectId, updates } = action.payload;
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
    clearAdminSideEffectsError: (state) => {
      state.adminSideEffectsError = null;
    },
    
    // Admin questions reducers
    fetchAdminQuestions: (state) => {
      state.adminQuestionsLoading = true;
      state.adminQuestionsError = null;
    },
    fetchAdminQuestionsSuccess: (state, action) => {
      state.adminQuestionsLoading = false;
      state.adminQuestions = action.payload;
    },
    fetchAdminQuestionsFailure: (state, action) => {
      state.adminQuestionsLoading = false;
      state.adminQuestionsError = action.payload;
    },
    deleteAdminQuestion: (state, action) => {
      const { questionId } = action.payload;
      state.adminQuestions.questions = state?.adminQuestions?.questions?.filter(q => q._id !== questionId);
    },
    deleteAdminQuestionSuccess: (state, action) => {
      const { questionId } = action.payload;
      state.adminQuestions.questions = state?.adminQuestions?.questions?.filter(q => q._id !== questionId);
    },
    deleteAdminQuestionFailure: (state, action) => {
      state.adminQuestionsError = action.payload;
    },
    clearAdminQuestionsError: (state) => {
      state.adminQuestionsError = null;
    },
    
    // Admin pre-appointment tasks reducers
    fetchAdminPreAppointmentTasks: (state) => {
      state.adminPreAppointmentTasksLoading = true;
      state.adminPreAppointmentTasksError = null;
    },
    fetchAdminPreAppointmentTasksSuccess: (state, action) => {
      state.adminPreAppointmentTasksLoading = false;
      state.adminPreAppointmentTasks = action.payload;
    },
    fetchAdminPreAppointmentTasksFailure: (state, action) => {
      state.adminPreAppointmentTasksLoading = false;
      state.adminPreAppointmentTasksError = action.payload;
    },
    clearAdminPreAppointmentTasksError: (state) => {
      state.adminPreAppointmentTasksError = null;
    },
  },
});

export const {
  setUsers,
  setTotalUsers,
  setStart,
  setLimit,
  setLength,
  setLoading,
  setError,
  fetchAdminMeals,
  fetchAdminMealsSuccess,
  fetchAdminMealsFailure,
  clearAdminMealsError,
  fetchAdminConsentForms,
  fetchAdminConsentFormsSuccess,
  fetchAdminConsentFormsFailure,
  updateAdminConsentForm,
  updateAdminConsentFormSuccess,
  updateAdminConsentFormFailure,
  clearAdminConsentFormsError,
  fetchAdminAppointmentTasks,
  fetchAdminAppointmentTasksSuccess,
  fetchAdminAppointmentTasksFailure,
  createAdminAppointmentTask,
  updateAdminAppointmentTask,
  clearAdminAppointmentTasksError,
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
  updateAdminMedication,
  clearAdminMedicationsError,
  fetchAdminMeasurements,
  fetchAdminMeasurementsSuccess,
  fetchAdminMeasurementsFailure,
  updateAdminMeasurement,
  clearAdminMeasurementsError,
  fetchAdminSideEffects,
  fetchAdminSideEffectsSuccess,
  fetchAdminSideEffectsFailure,
  updateAdminSideEffect,
  updateAdminSideEffectSuccess,
  updateAdminSideEffectFailure,
  clearAdminSideEffectsError,
  fetchAdminQuestions,
  fetchAdminQuestionsSuccess,
  fetchAdminQuestionsFailure,
  deleteAdminQuestion,
  deleteAdminQuestionSuccess,
  deleteAdminQuestionFailure,
  clearAdminQuestionsError,
  fetchAdminPreAppointmentTasks,
  fetchAdminPreAppointmentTasksSuccess,
  fetchAdminPreAppointmentTasksFailure,
  clearAdminPreAppointmentTasksError,
} = adminSlice.actions;

// Action creators for sagas
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

export const updateAdminMedicationAction = (payload) => ({
  type: 'admin/updateAdminMedication',
  payload,
});

export const fetchAdminMeasurementsAction = (payload) => ({
  type: 'admin/fetchAdminMeasurements',
  payload,
});

export const updateAdminMeasurementAction = (payload) => ({
  type: 'admin/updateAdminMeasurement',
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

export const deleteAdminQuestionSuccessAction = (payload) => ({
  type: 'admin/deleteAdminQuestionSuccess',
  payload,
});

export const deleteAdminQuestionFailureAction = (payload) => ({
  type: 'admin/deleteAdminQuestionFailure',
  payload,
});

export const fetchAdminPreAppointmentTasksAction = (payload) => ({
  type: 'admin/fetchAdminPreAppointmentTasks',
  payload,
});

export const updateAdminPreAppointmentTaskAction = (payload) => ({
  type: 'admin/updateAdminPreAppointmentTask',
  payload,
});

export const enableUserAccountAction = (payload) => ({
  type: 'admin/enableUserAccount',
  payload,
});

export const enableUserAccountSuccessAction = (payload) => ({
  type: 'admin/enableUserAccountSuccess',
  payload,
});

export const enableUserAccountFailureAction = (payload) => ({
  type: 'admin/enableUserAccountFailure',
  payload,
});

// Pagination and filtering action creators
export const setPage = (page) => ({
  type: 'admin/setPage',
  payload: page,
});

export const setRowsPerPage = (rowsPerPage) => ({
  type: 'admin/setRowsPerPage',
  payload: rowsPerPage,
});

export const setSearchTerm = (searchTerm) => ({
  type: 'admin/setSearchTerm',
  payload: searchTerm,
});

export const setStatusFilter = (statusFilter) => ({
  type: 'admin/setStatusFilter',
  payload: statusFilter,
});

export const setSort = (sort) => ({
  type: 'admin/setSort',
  payload: sort,
});

export const setSelectedUser = (selectedUser) => ({
  type: 'admin/setSelectedUser',
  payload: selectedUser,
});

export const setEditDialogOpen = (editDialogOpen) => ({
  type: 'admin/setEditDialogOpen',
  payload: editDialogOpen,
});

export const setPaginationData = (paginationData) => ({
  type: 'admin/setPaginationData',
  payload: paginationData,
});

export const resetFilters = () => ({
  type: 'admin/resetFilters',
});

export const fetchUsers = () => ({
  type: 'admin/fetchUsers',
});

export default adminSlice.reducer;