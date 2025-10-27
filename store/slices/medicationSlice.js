import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  medication: null,
  allMedications: [],
  isLoading: false,
  error: null,
  isSaved: false,
  isLoaded: false,
  allMedicationsLoaded: false,
};

const medicationSlice = createSlice({
  name: 'medication',
  initialState,
  reducers: {
    saveMedication: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false;
    },
    saveMedicationSuccess: (state, action) => {
      state.isLoading = false;
      state.medication = action.payload;
      state.isSaved = true;
      state.error = null;
    },
    saveMedicationFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSaved = false;
    },
    fetchMedication: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMedicationSuccess: (state, action) => {
      state.isLoading = false;
      state.medication = action.payload;
      state.isLoaded = true;
      state.error = null;
    },
    fetchMedicationFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isLoaded = false;
    },
    fetchAllMedications: (state) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false; // Reset save flag to prevent infinite loop
    },
    fetchAllMedicationsSuccess: (state, action) => {
      state.isLoading = false;
      state.allMedications = action.payload;
      state.allMedicationsLoaded = true;
      state.error = null;
    },
    fetchAllMedicationsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.allMedicationsLoaded = false;
    },
    clearMedicationError: (state) => {
      state.error = null;
    },
    resetMedication: (state) => {
      state.medication = null;
      state.allMedications = [];
      state.isLoading = false;
      state.error = null;
      state.isSaved = false;
      state.isLoaded = false;
      state.allMedicationsLoaded = false;
    },
  },
});

export const {
  saveMedication,
  saveMedicationSuccess,
  saveMedicationFailure,
  fetchMedication,
  fetchMedicationSuccess,
  fetchMedicationFailure,
  fetchAllMedications,
  fetchAllMedicationsSuccess,
  fetchAllMedicationsFailure,
  clearMedicationError,
  resetMedication,
} = medicationSlice.actions;

export default medicationSlice.reducer;

