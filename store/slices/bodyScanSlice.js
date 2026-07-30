import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  scans: [],
  current: null,
  isLoading: false,
  isSubmitting: false,
  isPolling: false,
  error: null,
  isLoaded: false,
};

const bodyScanSlice = createSlice({
  name: 'bodyScan',
  initialState,
  reducers: {
    createBodyScan: (state) => {
      state.isSubmitting = true;
      state.error = null;
    },
    createBodyScanSuccess: (state, action) => {
      state.isSubmitting = false;
      state.current = action.payload;
      state.error = null;
    },
    createBodyScanFailure: (state, action) => {
      state.isSubmitting = false;
      state.error = action.payload;
    },
    pollBodyScan: (state) => {
      state.isPolling = true;
      state.error = null;
    },
    pollBodyScanSuccess: (state, action) => {
      state.isPolling = false;
      state.current = action.payload;
      state.error = null;
    },
    pollBodyScanFailure: (state, action) => {
      state.isPolling = false;
      state.error = action.payload;
    },
    fetchBodyScans: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchBodyScansSuccess: (state, action) => {
      state.isLoading = false;
      state.scans = action.payload || [];
      state.isLoaded = true;
      state.error = null;
    },
    fetchBodyScansFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearBodyScanError: (state) => {
      state.error = null;
    },
    clearCurrentBodyScan: (state) => {
      state.current = null;
    },
  },
});

export const {
  createBodyScan,
  createBodyScanSuccess,
  createBodyScanFailure,
  pollBodyScan,
  pollBodyScanSuccess,
  pollBodyScanFailure,
  fetchBodyScans,
  fetchBodyScansSuccess,
  fetchBodyScansFailure,
  clearBodyScanError,
  clearCurrentBodyScan,
} = bodyScanSlice.actions;

export default bodyScanSlice.reducer;
