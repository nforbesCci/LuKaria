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
  searchTerm: '',
  statusFilter: 'all',
  page: 0,
  rowsPerPage: 10,
  sort: 'created_at:1',
  
  // UI state
  selectedUser: null,
  editDialogOpen: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // User data actions
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
    setPaginationData: (state, action) => {
      const { total, start, limit, length } = action.payload;
      state.totalUsers = total || 0;
      state.start = start || 0;
      state.limit = limit || 10;
      state.length = length || 0;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Search and filter actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.page = 0; // Reset to first page when searching
    },
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      state.page = 0; // Reset to first page when filtering
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setRowsPerPage: (state, action) => {
      state.rowsPerPage = action.payload;
      state.page = 0; // Reset to first page when changing rows per page
    },
    setSort: (state, action) => {
      state.sort = action.payload;
    },
    
    // UI actions
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setEditDialogOpen: (state, action) => {
      state.editDialogOpen = action.payload;
    },
    
    // Reset actions
    resetFilters: (state) => {
      state.searchTerm = '';
      state.statusFilter = 'all';
      state.page = 0;
      state.sort = 'created_at:1';
    },
    resetAdmin: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setUsers,
  setTotalUsers,
  setStart,
  setLimit,
  setLength,
  setPaginationData,
  setLoading,
  setError,
  clearError,
  setSearchTerm,
  setStatusFilter,
  setPage,
  setRowsPerPage,
  setSort,
  setSelectedUser,
  setEditDialogOpen,
  resetFilters,
  resetAdmin,
} = adminSlice.actions;

export default adminSlice.reducer;
