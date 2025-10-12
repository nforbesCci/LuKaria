import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  measurements: null,
  allMeasurements: [],
  isLoading: false,
  error: null,
  isSaved: false,
  isLoaded: false,
  allMeasurementsLoaded: false,
};

const measurementsSlice = createSlice({
  name: 'measurements',
  initialState,
  reducers: {
    saveMeasurements: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false;
    },
    saveMeasurementsSuccess: (state, action) => {
      state.isLoading = false;
      state.measurements = action.payload;
      state.isSaved = true;
      state.error = null;
    },
    saveMeasurementsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSaved = false;
    },
    fetchMeasurements: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMeasurementsSuccess: (state, action) => {
      state.isLoading = false;
      state.measurements = action.payload;
      state.isLoaded = true;
      state.error = null;
    },
    fetchMeasurementsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isLoaded = false;
    },
    fetchAllMeasurements: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchAllMeasurementsSuccess: (state, action) => {
      state.isLoading = false;
      state.allMeasurements = action.payload;
      state.allMeasurementsLoaded = true;
      state.error = null;
    },
    fetchAllMeasurementsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.allMeasurementsLoaded = false;
    },
    clearMeasurementsError: (state) => {
      state.error = null;
    },
    resetMeasurements: (state) => {
      state.measurements = null;
      state.allMeasurements = [];
      state.isLoading = false;
      state.error = null;
      state.isSaved = false;
      state.isLoaded = false;
      state.allMeasurementsLoaded = false;
    },
  },
});

export const {
  saveMeasurements,
  saveMeasurementsSuccess,
  saveMeasurementsFailure,
  fetchMeasurements,
  fetchMeasurementsSuccess,
  fetchMeasurementsFailure,
  fetchAllMeasurements,
  fetchAllMeasurementsSuccess,
  fetchAllMeasurementsFailure,
  clearMeasurementsError,
  resetMeasurements,
} = measurementsSlice.actions;

export default measurementsSlice.reducer;
