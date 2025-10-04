import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    parish: '',
    height: {
      feet: '',
      inches: '',
    },
    weight: '',
    bmi: null,
    medicalHistory: [],
    currentMedications: [],
    allergies: [],
  },
  isProfileComplete: false,
  isScheduled: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updatePersonalInfo: (state, action) => {
      const { firstName, lastName, email, phone, dateOfBirth, gender, address, parish } = action.payload;
      state.profile = {
        ...state.profile,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        parish,
      };
    },
    updateHealthInfo: (state, action) => {
      const { height, weight, bmi } = action.payload;
      state.profile = {
        ...state.profile,
        height,
        weight,
        bmi,
      };
    },
    updateMedicalHistory: (state, action) => {
      state.profile.medicalHistory = action.payload;
    },
    updateCurrentMedications: (state, action) => {
      state.profile.currentMedications = action.payload;
    },
    updateAllergies: (state, action) => {
      state.profile.allergies = action.payload;
    },
    setProfileComplete: (state, action) => {
      state.isProfileComplete = action.payload;
    },
    setIsScheduled: (state, action) => {
      state.isScheduled = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetProfile: (state) => {
      state.profile = initialState.profile;
      state.isProfileComplete = false;
      state.isScheduled = false;
      state.error = null;
    },
  },
});

export const {
  setProfile,
  updatePersonalInfo,
  updateHealthInfo,
  updateMedicalHistory,
  updateCurrentMedications,
  updateAllergies,
  setProfileComplete,
  setIsScheduled,
  setLoading,
  setError,
  clearError,
  resetProfile,
} = userSlice.actions;

// Action creators for sagas
export const updatePersonalInfoAsync = (personalData) => ({
  type: 'user/updatePersonalInfo',
  payload: personalData,
});

export const updateHealthInfoAsync = (healthData) => ({
  type: 'user/updateHealthInfo',
  payload: healthData,
});

export const loadUserProfile = () => ({
  type: 'user/loadUserProfile',
});

export default userSlice.reducer;
