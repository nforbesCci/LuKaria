'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Pagination,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { 
  CalendarToday, 
  Person, 
  Email, 
  AccessTime,
  Schedule,
  Refresh
} from '@mui/icons-material';
import SEO from '../../../components/SEO';
import { useDispatch, useSelector } from 'react-redux';
import { setAdminRescheduleSuccess } from '../../../store/slices/appointmentSlice';
import RescheduleAppointment from '../../../components/RescheduleAppointment';

export default function RescheduleRequestsPage() {
  const { user, isLoading: userLoading } = useUser();
  const dispatch = useDispatch();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'reschedule'
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Check if user is admin/doctor
  const isAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (user['https://lukariagroup.com/roles'].includes('Admin') || user['https://lukariagroup.com/roles'].includes('Doctor')))
  );

  const fetchRescheduleRequests = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/reschedule-requests?page=${page}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reschedule requests');
      }
      
      if (data.success) {
        setRequests(data.data.requests);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch reschedule requests');
      }
    } catch (err) {
      console.error('Error fetching reschedule requests:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !userLoading) {
      if (isAdmin) {
        fetchRescheduleRequests();
      } else {
        setError('Access denied. Admin or Doctor role required.');
        setLoading(false);
      }
    }
  }, [user, userLoading, isAdmin]);

  const handlePageChange = (event, page) => {
    fetchRescheduleRequests(page);
  };

  const handleRefresh = () => {
    fetchRescheduleRequests(pagination.currentPage);
  };

  const handleReBook = (request) => {
    setSelectedRequest(request);
    setCurrentView('reschedule');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedRequest(null);
    // Clear any success state from previous reschedule operations
    dispatch(setAdminRescheduleSuccess(false));
  };

  const handleRescheduleSuccess = (rescheduleData) => {
    console.log('Appointment rescheduled:', rescheduleData);
    // Refresh the requests list and go back to list view
    fetchRescheduleRequests(pagination.currentPage);
    setCurrentView('list');
    setSelectedRequest(null);
    // Clear the success state to prevent issues on next re-book
    dispatch(setAdminRescheduleSuccess(false));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAppointmentDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (userLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Please log in to access this page.
        </Alert>
      </Container>
    );
  }

  if (!isAdmin) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Access denied. Admin or Doctor role required to view reschedule requests.
        </Alert>
      </Container>
    );
  }

  // Show reschedule component if in reschedule view
  if (currentView === 'reschedule' && selectedRequest) {
    return (
      <>
        <SEO 
          title="Reschedule Appointment - Admin"
          description="Reschedule appointment for patient"
          keywords="admin, reschedule, appointment, management"
          canonical="https://www.lukariagroup.com/admin/reschedule-requests"
        />
        <RescheduleAppointment
          request={selectedRequest}
          onReschedule={handleRescheduleSuccess}
          onBack={handleBackToList}
        />
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Reschedule Requests - Admin"
        description="View and manage appointment reschedule requests"
        keywords="admin, reschedule, appointments, management"
        canonical="https://www.lukariagroup.com/admin/reschedule-requests"
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#877449', fontWeight: '600' }}>
              Reschedule Requests
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
              sx={{ 
                borderColor: '#877449', 
                color: '#877449',
                '&:hover': {
                  borderColor: '#B8941F',
                  backgroundColor: 'rgba(135, 116, 73, 0.04)'
                }
              }}
            >
              Refresh
            </Button>
          </Box>
          <Divider sx={{ borderColor: '#877449' }} />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Summary Stats */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600' }}>
                      {pagination.totalCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Requests
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600' }}>
                      {pagination.currentPage}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Page
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600' }}>
                      {pagination.totalPages}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Pages
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Requests List */}
            {requests.length === 0 ? (
              <Alert severity="info">
                No reschedule requests found.
              </Alert>
            ) : (
              <Stack spacing={3}>
                {requests.map((request, index) => (
                  <Card key={request._id || index} sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                              Patient Information
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Person sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                              <Typography variant="body1">
                                {request.userName || 'Name not available'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Email sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                              <Typography variant="body2" color="text.secondary">
                                {request.userEmail || 'Email not available'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                User ID: {request.userId}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                              Current Appointment
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarToday sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                              <Typography variant="body2">
                                {formatAppointmentDate(request.date)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AccessTime sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                              <Typography variant="body2">
                                {request.time || 'Time not specified'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Schedule sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                              <Typography variant="body2">
                                {request.type || 'consultation'} • {request.length || 'Duration not specified'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="h6" sx={{ color: '#877449', mb: 2 }}>
                              Request Details
                            </Typography>
                            <Chip
                              label="Reschedule Requested"
                              color="warning"
                              sx={{ mb: 2 }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Requested: {formatDate(request.rescheduleRequestedAt)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Status: {request.status || 'request appointment'}
                            </Typography>
                            {request.updatedAt && (
                              <Typography variant="body2" color="text.secondary">
                                Last Updated: {formatDate(request.updatedAt)}
                              </Typography>
                            )}
                            
                            <Box sx={{ mt: 3, display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                              <Button
                                variant="contained"
                                size="small"
                                sx={{
                                  backgroundColor: '#877449',
                                  color: 'white',
                                  textTransform: 'none',
                                  fontWeight: '600',
                                  px: 2,
                                  py: 1,
                                  '&:hover': {
                                    backgroundColor: '#B8941F',
                                  }
                                }}
                                onClick={() => handleReBook(request)}
                              >
                                Re-book
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#877449',
                      '&.Mui-selected': {
                        backgroundColor: '#877449',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#B8941F',
                        }
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(135, 116, 73, 0.04)',
                      }
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </>
  );
}

