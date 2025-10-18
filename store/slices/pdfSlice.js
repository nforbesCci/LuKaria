import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isGenerating: false,
  isSending: false,
  isUploading: false,
  error: null,
  success: null,
  pdfBlob: null,
  uploadUrl: null,
};

const pdfSlice = createSlice({
  name: 'pdf',
  initialState,
  reducers: {
    generatePdfStart: (state) => {
      state.isGenerating = true;
      state.error = null;
      state.success = null;
    },
    generatePdfSuccess: (state, action) => {
      state.isGenerating = false;
      state.pdfBlob = action.payload;
    },
    generatePdfFailure: (state, action) => {
      state.isGenerating = false;
      state.error = action.payload;
    },
    sendPdfStart: (state) => {
      state.isSending = true;
      state.error = null;
      state.success = null;
    },
    sendPdfSuccess: (state, action) => {
      state.isSending = false;
      state.success = action.payload;
    },
    sendPdfFailure: (state, action) => {
      state.isSending = false;
      state.error = action.payload;
    },
    uploadPdfStart: (state) => {
      state.isUploading = true;
      state.error = null;
      state.success = null;
    },
    uploadPdfSuccess: (state, action) => {
      state.isUploading = false;
      state.uploadUrl = action.payload;
    },
    uploadPdfFailure: (state, action) => {
      state.isUploading = false;
      state.error = action.payload;
    },
    clearPdfState: (state) => {
      state.isGenerating = false;
      state.isSending = false;
      state.isUploading = false;
      state.error = null;
      state.success = null;
      state.pdfBlob = null;
      state.uploadUrl = null;
    },
  },
});

export const {
  generatePdfStart,
  generatePdfSuccess,
  generatePdfFailure,
  sendPdfStart,
  sendPdfSuccess,
  sendPdfFailure,
  uploadPdfStart,
  uploadPdfSuccess,
  uploadPdfFailure,
  clearPdfState,
} = pdfSlice.actions;

export default pdfSlice.reducer;
