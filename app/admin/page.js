'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useAdminAccess } from '../../hooks/useAccessControl';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/Header';
import {
  setSearchTerm,
  setStatusFilter,
  setPage,
  setRowsPerPage,
  setSort,
  setSelectedUser,
  setEditDialogOpen,
  resetFilters,
} from '../../store/slices/adminSlice';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Grid,
  TextField,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  AdminPanelSettings,
  Search,
  FilterList,
  Edit,
  Block,
  CheckCircle,
  Email,
  Person,
  CalendarToday,
  MoreVert,
  Refresh,
} from '@mui/icons-material';

export default function AdminPage() {
  const { user, isLoading, error } = useUser();
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Access control - only Admin and Doctor can access
  useAdminAccess();
  const [mounted, setMounted] = useState(false);

  // Debug: Log user object to see what's available
  useEffect(() => {
    if (user) {
      console.log('User object:', user);
      console.log('User groups (https://lukaria.com/groups):', user['https://lukaria.com/groups']);
      console.log('User groups (groups):', user.groups);
      console.log('User roles:', user.roles);
      console.log('Custom claims:', user.customClaims);
      console.log('All user properties:', Object.keys(user));
    }
  }, [user]);

  // Check if user is in doctor or admin group using processed custom claims
  const isAuthorized = user && 
  // Check processed custom claims first
  (user?.groups && user.groups.some(item => item.toLowerCase() === "doctor" || item.toLowerCase() === "admin"));
  
  
  // Get state from Redux store
  const {
    users,
    totalUsers,
    start,
    limit,
    length,
    loading,
    error: errorMessage,
    searchTerm,
    statusFilter,
    page,
    rowsPerPage,
    sort,
    selectedUser,
    editDialogOpen,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow all authenticated users to access admin page
  const isAdmin = true;

  useEffect(() => {
    if (user && isAdmin) {
      dispatch({ type: 'admin/fetchUsers' });
    }
  }, [user, isAdmin, page, rowsPerPage, searchTerm, statusFilter, sort, dispatch]);

  const fetchUsers = () => {
    dispatch({ type: 'admin/fetchUsers' });
  };

  const handleSearchChange = (event) => {
    dispatch(setSearchTerm(event.target.value));
  };

  const handleStatusFilterChange = (event) => {
    dispatch(setStatusFilter(event.target.value));
  };

  const handleChangePage = (event, newPage) => {
    dispatch(setPage(newPage));
  };

  const handleChangeRowsPerPage = (event) => {
    dispatch(setRowsPerPage(parseInt(event.target.value, 10)));
  };

  const handleEditUser = (user) => {
    dispatch(setSelectedUser(user));
    dispatch(setEditDialogOpen(true));
  };

  const handleUpdateUser = async (updates) => {
    dispatch({
      type: 'admin/updateUser',
      payload: {
        userId: selectedUser.user_id,
        updates,
      },
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserStatus = (user) => {
    if (user.blocked) return { status: 'Blocked', color: 'error' };
    if (user.email_verified) return { status: 'Verified', color: 'success' };
    return { status: 'Pending', color: 'warning' };
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading admin panel...
          </Typography>
        </Container>
      </>
    );
  }

  // Check authorization after loading
  if (!isAuthorized) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1">
              You do not have permission to access the administration panel. 
              This area is restricted to doctors and administrators only.
            </Typography>
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => router.push('/dashboard')}
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">
            Error loading admin panel: {error.message}
          </Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8 }}>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h2" component="h1" gutterBottom color="primary">
              Access Denied
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Please log in to access the admin panel.
            </Typography>
            <Button
              href="/api/auth/login"
              variant="contained"
              size="large"
              startIcon={<AdminPanelSettings />}
              sx={{ textTransform: 'none' }}
            >
              Log In
            </Button>
          </Box>
        </Container>
      </>
    );
  }


  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading admin panel...
          </Typography>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ 
                  width: 60, 
                  height: 60, 
                  mr: 3, 
                  backgroundColor: 'primary.main' 
                }}
              >
                <AdminPanelSettings sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography 
                  variant="h4" 
                  gutterBottom 
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '2.125rem' },
                    fontWeight: 600
                  }}
                >
                  Administrative Panel
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  User Management • Total Users: {totalUsers} • Start: {start} • Limit: {limit} • Length: {length}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchUsers}
              sx={{ textTransform: 'none' }}
            >
              Refresh
            </Button>
          </Box>
        </Paper>

        {/* Filters */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search users by name, email, or nickname..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Status"
                  >
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="blocked">Blocked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  sx={{ textTransform: 'none', height: '56px' }}
                  onClick={fetchUsers}
                >
                  Apply Filters
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Users Table */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Loading users...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => {
                      const userStatus = getUserStatus(user);
                      return (
                        <Tooltip title="Double-click to view user details" key={user.user_id}>
                          <TableRow 
                            hover
                            onDoubleClick={() => router.push(`/admin/user/${user.user_id}`)}
                            sx={{ cursor: 'pointer' }}
                          >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                src={user.picture}
                                sx={{ width: 40, height: 40, mr: 2 }}
                              >
                                <Person />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.name || user.nickname || 'No name'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {user.user_id.slice(0, 8)}...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Email sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {user.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={userStatus.status}
                              color={userStatus.color}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {user.last_login ? formatDate(user.last_login) : 'Never'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarToday sx={{ fontSize: 16, mr: 1, color: '#877449' }} />
                              <Typography variant="body2">
                                {formatDate(user.created_at)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Edit User">
                              <IconButton
                                size="small"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          </TableRow>
                        </Tooltip>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalUsers}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              labelDisplayedRows={({ from, to, count }) => {
                console.log('📊 Pagination display:', { 
                  from, 
                  to, 
                  count, 
                  totalUsers, 
                  start, 
                  limit, 
                  length,
                  usersLength: users.length 
                });
                return `${from}-${to} of ${count}`;
              }}
            />
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => dispatch(setEditDialogOpen(false))} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Stack spacing={3} sx={{ mt: 2 }}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    User ID
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.user_id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Name
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.name || 'Not set'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Status
                  </Typography>
                  <Chip
                    label={getUserStatus(selectedUser).status}
                    color={getUserStatus(selectedUser).color}
                    size="small"
                  />
                </Box>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  User editing functionality can be extended here. This is a basic view of user information.
                </Typography>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => dispatch(setEditDialogOpen(false))}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
