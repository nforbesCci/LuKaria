import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  photographConsent: null,
  mounjaroConsent: null,
  telehealthConsent: null,
  isLoading: false,
  isFetching: false,
  error: null,
  isSaved: false,
  hasChanges: false,
  isLoaded: false,
  mounjaroHasChanges: false,
  mounjaroIsSaved: false,
  telehealthHasChanges: false,
  telehealthIsSaved: false,
};

const consentSlice = createSlice({
  name: 'consent',
  initialState,
  reducers: {
    savePhotographConsent: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false;
    },
    savePhotographConsentSuccess: (state, action) => {
      state.isLoading = false;
      state.photographConsent = action.payload;
      state.isSaved = true;
      state.hasChanges = false;
      state.error = null;
    },
    savePhotographConsentFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSaved = false;
    },
    fetchPhotographConsent: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    fetchPhotographConsentSuccess: (state, action) => {
      state.isFetching = false;
      state.photographConsent = action.payload;
      state.isLoaded = true;
      state.error = null;
    },
    fetchPhotographConsentFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
      state.isLoaded = false;
    },
    setConsentChanges: (state, action) => {
      state.hasChanges = action.payload;
    },
    resetConsentSaveFlag: (state) => {
      state.isSaved = false;
    },
    clearConsentError: (state) => {
      state.error = null;
    },
    // Mounjaro consent actions
    saveMounjaroConsent: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.mounjaroIsSaved = false;
    },
    saveMounjaroConsentSuccess: (state, action) => {
      state.isLoading = false;
      state.mounjaroConsent = action.payload;
      state.mounjaroIsSaved = true;
      state.mounjaroHasChanges = false;
      state.error = null;
    },
    saveMounjaroConsentFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.mounjaroIsSaved = false;
    },
    setMounjaroConsentChanges: (state, action) => {
      state.mounjaroHasChanges = action.payload;
    },
    resetMounjaroConsentSaveFlag: (state) => {
      state.mounjaroIsSaved = false;
    },
    fetchMounjaroConsent: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    fetchMounjaroConsentSuccess: (state, action) => {
      state.isFetching = false;
      state.mounjaroConsent = action.payload;
      state.isLoaded = true;
      state.error = null;
    },
    fetchMounjaroConsentFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
    // Telehealth consent actions
    saveTelehealthConsent: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.telehealthIsSaved = false;
    },
    saveTelehealthConsentSuccess: (state, action) => {
      state.isLoading = false;
      state.telehealthConsent = action.payload;
      state.telehealthIsSaved = true;
      state.telehealthHasChanges = false;
      state.error = null;
    },
    saveTelehealthConsentFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.telehealthIsSaved = false;
    },
    setTelehealthConsentChanges: (state, action) => {
      state.telehealthHasChanges = action.payload;
    },
    resetTelehealthConsentSaveFlag: (state) => {
      state.telehealthIsSaved = false;
    },
    fetchTelehealthConsent: (state) => {
      state.isFetching = true;
      state.error = null;
    },
    fetchTelehealthConsentSuccess: (state, action) => {
      state.isFetching = false;
      state.telehealthConsent = action.payload;
      state.isLoaded = true;
      state.error = null;
    },
    fetchTelehealthConsentFailure: (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    },
  },
});

export const {
  savePhotographConsent,
  savePhotographConsentSuccess,
  savePhotographConsentFailure,
  fetchPhotographConsent,
  fetchPhotographConsentSuccess,
  fetchPhotographConsentFailure,
  setConsentChanges,
  resetConsentSaveFlag,
  clearConsentError,
  saveMounjaroConsent,
  saveMounjaroConsentSuccess,
  saveMounjaroConsentFailure,
  setMounjaroConsentChanges,
  resetMounjaroConsentSaveFlag,
  fetchMounjaroConsent,
  fetchMounjaroConsentSuccess,
  fetchMounjaroConsentFailure,
  saveTelehealthConsent,
  saveTelehealthConsentSuccess,
  saveTelehealthConsentFailure,
  setTelehealthConsentChanges,
  resetTelehealthConsentSaveFlag,
  fetchTelehealthConsent,
  fetchTelehealthConsentSuccess,
  fetchTelehealthConsentFailure,
} = consentSlice.actions;

export default consentSlice.reducer;

