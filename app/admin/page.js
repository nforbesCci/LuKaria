'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
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
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Dummy user data for demonstration
  const dummyUsers = [
    {
      user_id: 'auth0|507f1f77bcf86cd799439011',
      email: 'john.doe@example.com',
      name: 'John Doe',
      nickname: 'johndoe',
      picture: 'https://via.placeholder.com/40x40/1976d2/ffffff?text=JD',
      email_verified: true,
      blocked: false,
      created_at: '2024-01-15T10:30:00.000Z',
      last_login: '2024-01-20T14:22:00.000Z',
      user_metadata: {
        role: 'user',
        phone_number: '+1-555-0123'
      }
    },
    {
      user_id: 'auth0|507f1f77bcf86cd799439012',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      nickname: 'janesmith',
      picture: 'https://via.placeholder.com/40x40/dc004e/ffffff?text=JS',
      email_verified: false,
      blocked: false,
      created_at: '2024-01-18T09:15:00.000Z',
      last_login: null,
      user_metadata: {
        role: 'user',
        phone_number: '+1-555-0124'
      }
    },
    {
      user_id: 'auth0|507f1f77bcf86cd799439013',
      email: 'admin@svelte.com',
      name: 'Admin User',
      nickname: 'admin',
      picture: 'https://via.placeholder.com/40x40/2e7d32/ffffff?text=AD',
      email_verified: true,
      blocked: false,
      created_at: '2024-01-10T08:00:00.000Z',
      last_login: '2024-01-20T16:45:00.000Z',
      user_metadata: {
        role: 'admin',
        phone_number: '+1-555-0125'
      }
    },
    {
      user_id: 'auth0|507f1f77bcf86cd799439014',
      email: 'blocked.user@example.com',
      name: 'Blocked User',
      nickname: 'blockeduser',
      picture: 'https://via.placeholder.com/40x40/f57c00/ffffff?text=BU',
      email_verified: true,
      blocked: true,
      created_at: '2024-01-12T11:20:00.000Z',
      last_login: '2024-01-19T12:30:00.000Z',
      user_metadata: {
        role: 'user',
        phone_number: '+1-555-0126'
      }
    }
  ];
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Allow all authenticated users to access admin page
  const isAdmin = true;

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, page, rowsPerPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Filter dummy users based on search term
      let filteredUsers = dummyUsers;
      if (searchTerm) {
        filteredUsers = dummyUsers.filter(user => 
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        filteredUsers = filteredUsers.filter(user => {
          switch (statusFilter) {
            case 'verified':
              return user.email_verified && !user.blocked;
            case 'pending':
              return !user.email_verified && !user.blocked;
            case 'blocked':
              return user.blocked;
            default:
              return true;
          }
        });
      }

      // Apply pagination
      const startIndex = page * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      setUsers(paginatedUsers);
      setTotalUsers(filteredUsers.length);
    } catch (err) {
      console.error('Error fetching users:', err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleUpdateUser = async (updates) => {
    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.user_id,
          updates,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      // Refresh the users list
      await fetchUsers();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setErrorMessage(err.message);
    }
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
                  User Management • Total Users: {dummyUsers.length}
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
                              <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
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
            />
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setEditDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
