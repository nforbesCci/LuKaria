import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  meals: {},
  isLoading: false,
  error: null,
  isSaved: false,
};

const mealsSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    saveMeals: (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.isSaved = false;
    },
    saveMealsSuccess: (state, action) => {
      state.isLoading = false;
      state.isSaved = true;
      state.error = null;
      // Update meals for the specific date
      if (action.payload.date && action.payload.meals) {
        state.meals[action.payload.date] = action.payload.meals;
      }
    },
    saveMealsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isSaved = false;
    },
    fetchMeals: (state, action) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMealsSuccess: (state, action) => {
      state.isLoading = false;
      state.meals = action.payload.meals || {};
      state.error = null;
    },
    fetchMealsFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearMealsError: (state) => {
      state.error = null;
    },
    resetSaveFlag: (state) => {
      state.isSaved = false;
    },
  },
});

export const {
  saveMeals,
  saveMealsSuccess,
  saveMealsFailure,
  fetchMeals,
  fetchMealsSuccess,
  fetchMealsFailure,
  clearMealsError,
  resetSaveFlag,
} = mealsSlice.actions;

export default mealsSlice.reducer;

