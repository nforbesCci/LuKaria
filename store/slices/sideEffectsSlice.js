import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sideEffects: null,
  isLoading: false,
  error: null,
  isSaved: false,
};

const sideEffectsSlice = createSlice({
  name: 'sideEffects',
  initialState,
  reducers: {
    saveSideEffects: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false;
    },
    saveSideEffectsSuccess: (state, action) => {
      state.isLoading = false;
      state.sideEffects = action.payload;
      state.isSaved = true;
      state.error = null;
    },
    saveSideEffectsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSaved = false;
    },
    fetchSideEffects: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchSideEffectsSuccess: (state, action) => {
      state.isLoading = false;
      state.sideEffects = action.payload;
      state.error = null;
    },
    fetchSideEffectsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearSideEffectsError: (state) => {
      state.error = null;
    },
    resetSaveFlag: (state) => {
      state.isSaved = false;
    },
  },
});

export const {
  saveSideEffects,
  saveSideEffectsSuccess,
  saveSideEffectsFailure,
  fetchSideEffects,
  fetchSideEffectsSuccess,
  fetchSideEffectsFailure,
  clearSideEffectsError,
  resetSaveFlag,
} = sideEffectsSlice.actions;

export default sideEffectsSlice.reducer;

