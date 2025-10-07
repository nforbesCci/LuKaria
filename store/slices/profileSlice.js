import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  isSaved: false,
  isLoaded: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    saveProfile: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false;
    },
    saveProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
      state.isSaved = true;
      state.error = null;
    },
    saveProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSaved = false;
    },
    fetchProfile: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action) => {
      state.isLoading = false;
      state.profile = action.payload;
      state.isLoaded = true;
      state.error = null;
    },
    fetchProfileFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isLoaded = false;
    },
    clearProfileError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      state.profile = null;
      state.isLoading = false;
      state.error = null;
      state.isSaved = false;
    },
    resetSaveFlag: (state) => {
      state.isSaved = false;
    },
  },
});

export const {
  saveProfile,
  saveProfileSuccess,
  saveProfileFailure,
  fetchProfile,
  fetchProfileSuccess,
  fetchProfileFailure,
  clearProfileError,
  resetProfile,
  resetSaveFlag,
} = profileSlice.actions;

export default profileSlice.reducer;
