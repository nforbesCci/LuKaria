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
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import { useUser } from '@auth0/nextjs-auth0/client';
import { 
  Person, 
  Email, 
  Phone,
  CalendarToday,
  LocationOn,
  MedicalServices,
  Warning,
  CheckCircle,
  Message,
  Refresh,
  Visibility,
  Close,
  Done
} from '@mui/icons-material';
import SEO from '../../../components/SEO';

export default function AdminSideEffectsPage() {
  const { user, isLoading: userLoading } = useUser();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Check if user is admin/doctor
  const isAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (user['https://lukariagroup.com/roles'].includes('Admin') || user['https://lukariagroup.com/roles'].includes('Doctor')))
  );

  const fetchSideEffectsReports = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/side-effects?page=${page}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch side effects reports');
      }
      
      if (data.success) {
        setReports(data.data.reports);
        setPagination(data.data.pagination);
      } else {
        throw new Error(data.error || 'Failed to fetch side effects reports');
      }
    } catch (err) {
      console.error('Error fetching side effects reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !userLoading) {
      if (isAdmin) {
        fetchSideEffectsReports();
      } else {
        setError('Access denied. Admin or Doctor role required.');
        setLoading(false);
      }
    }
  }, [user, userLoading, isAdmin]);

  const handlePageChange = (event, page) => {
    fetchSideEffectsReports(page);
  };

  const handleRefresh = () => {
    fetchSideEffectsReports(pagination.currentPage);
  };

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedReport(null);
  };

  const handleMarkAsReviewed = async (reportId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Marking side effect as reviewed:', reportId);
      
      const response = await fetch('/api/admin/side-effects/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
      });
      
      console.log('📡 API Response status:', response.status);
      console.log('📡 API Response headers:', response.headers);
      
      // Check if response is HTML (404/500 error page)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const htmlText = await response.text();
        console.error('❌ Received HTML instead of JSON:', htmlText.substring(0, 200));
        throw new Error('Server returned an error page. Please check if the API endpoint exists.');
      }
      
      const data = await response.json();
      console.log('📨 API Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as reviewed');
      }
      
      if (data.success) {
        console.log('✅ Successfully marked as reviewed');
        // Update the selected report to show it's been reviewed
        setSelectedReport(prev => ({
          ...prev,
          reviewed: true,
          reviewedAt: new Date().toISOString(),
          reviewedBy: user.sub
        }));
        
        // Refresh the reports list
        fetchSideEffectsReports(pagination.currentPage);
      } else {
        throw new Error(data.error || 'Failed to mark as reviewed');
      }
    } catch (err) {
      console.error('❌ Error marking as reviewed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

  const getSideEffectsCount = (report) => {
    const sideEffects = report.sideEffects || [];
    const otherSideEffect = report.otherSideEffect || '';
    return sideEffects.length + (otherSideEffect ? 1 : 0);
  };

  const getSeverityColor = (report) => {
    const count = getSideEffectsCount(report);
    if (count === 0) return 'success';
    if (count <= 2) return 'warning';
    return 'error';
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
          Access denied. Admin or Doctor role required to view side effects reports.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <SEO 
        title="Side Effects Reports - Admin"
        description="View and manage patient side effects reports"
        keywords="admin, side effects, reports, patient management, Kadria, Kadria Fairclough, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com/admin/side-effects"
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" sx={{ color: '#877449', fontWeight: '600' }}>
              Side Effects Reports
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
        ) : viewMode === 'list' ? (
          <>
            {/* Summary Stats */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600' }}>
                      {pagination.totalCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Reports
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600' }}>
                      {reports.filter(r => getSideEffectsCount(r) > 0).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      With Side Effects
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: '600' }}>
                      {pagination.currentPage}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current Page
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={3}>
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

            {/* Reports List */}
            {reports.length === 0 ? (
              <Alert severity="info">
                No side effects reports found.
              </Alert>
            ) : (
              <Stack spacing={3}>
                {reports.map((report, index) => (
                  <Card key={report._id || index} sx={{ border: '1px solid #e0e0e0' }}>
                    <CardContent>
                      <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ mr: 2, backgroundColor: '#877449' }}>
                              <Person />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#877449' }}>
                                {report.userInfo?.name || 'Unknown Patient'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Report ID: {report.reportId}
                              </Typography>
                            </Box>
                          </Box>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Email sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                                <Typography variant="body2">
                                  {report.userInfo?.email || 'No email'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Phone sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                                <Typography variant="body2">
                                  {report.userInfo?.phone || 'No phone'}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CalendarToday sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                                <Typography variant="body2">
                                  Submitted: {formatDate(report.createdAt)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationOn sx={{ mr: 1, color: '#877449', fontSize: 20 }} />
                                <Typography variant="body2">
                                  {report.userInfo?.parish || 'No parish'}
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Box sx={{ mb: 2 }}>
                              <Chip
                                label={`${getSideEffectsCount(report)} Side Effects`}
                                color={getSeverityColor(report)}
                                sx={{ mb: 1 }}
                              />
                              {report.requestDoctorContact && (
                                <Chip
                                  label="Doctor Contact Requested"
                                  color="warning"
                                  size="small"
                                  sx={{ ml: 1 }}
                                />
                              )}
                            </Box>
                            <Button
                              variant="contained"
                              startIcon={<Visibility />}
                              onClick={() => handleViewDetails(report)}
                              sx={{
                                backgroundColor: '#877449',
                                '&:hover': {
                                  backgroundColor: '#B8941F'
                                }
                              }}
                            >
                              View Details
                            </Button>
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
        ) : (
          /* Detail View */
          <Box>
            {/* Back Button */}
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Close />}
                onClick={handleBackToList}
                sx={{ 
                  borderColor: '#877449', 
                  color: '#877449',
                  '&:hover': {
                    borderColor: '#B8941F',
                    backgroundColor: 'rgba(135, 116, 73, 0.04)'
                  }
                }}
              >
                Back to Reports List
              </Button>
            </Box>

            {/* Detail Content */}
            {selectedReport && (
              <Stack spacing={3}>
                {/* Action Buttons - Moved to top */}
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 2,
                    alignItems: 'center'
                  }}>
                    {!selectedReport.reviewed ? (
                      <Button
                        variant="contained"
                        startIcon={<Done />}
                        onClick={() => handleMarkAsReviewed(selectedReport._id)}
                        disabled={loading}
                        sx={{
                          backgroundColor: '#2e7d32',
                          '&:hover': {
                            backgroundColor: '#1b5e20'
                          }
                        }}
                      >
                        Mark as Reviewed
                      </Button>
                    ) : (
                      <Chip 
                        label="Already Reviewed" 
                        color="success"
                        icon={<CheckCircle />}
                        size="large"
                      />
                    )}
                  </Box>
                </Paper>

                {/* Patient Information */}
                <Paper sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h5" sx={{ color: '#877449', mb: 3, fontWeight: '600' }}>
                    Patient Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="h6">{selectedReport.userInfo?.name || 'Unknown'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="h6">{selectedReport.userInfo?.email || 'No email'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography variant="h6">{selectedReport.userInfo?.phone || 'No phone'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="h6">{selectedReport.userInfo?.dateOfBirth || 'No DOB'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Parish</Typography>
                      <Typography variant="h6">{selectedReport.userInfo?.parish || 'No parish'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Side Effects */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ color: '#877449', mb: 3, fontWeight: '600' }}>
                    Reported Side Effects
                  </Typography>
                  {selectedReport.sideEffects && selectedReport.sideEffects.length > 0 ? (
                    <List>
                      {selectedReport.sideEffects.map((effect, index) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon>
                            <Warning color="warning" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={effect}
                            primaryTypographyProps={{ variant: 'h6' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="h6" color="text.secondary">
                      No side effects reported
                    </Typography>
                  )}
                  
                  {selectedReport.otherSideEffect && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                        Other Side Effect:
                      </Typography>
                      <Typography variant="h6">
                        {selectedReport.otherSideEffect}
                      </Typography>
                    </Box>
                  )}
                </Paper>

                {/* Additional Information */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h5" sx={{ color: '#877449', mb: 3, fontWeight: '600' }}>
                    Additional Information
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                      Appetite Suppressed:
                    </Typography>
                    <Typography variant="h6">
                      {selectedReport.appetiteSuppressed || 'Not specified'}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                      Treatment Concerns:
                    </Typography>
                    <Typography variant="h6">
                      {selectedReport.hasTreatmentConcerns || 'No concerns reported'}
                    </Typography>
                    {selectedReport.treatmentConcerns && (
                      <Typography variant="h6" sx={{ mt: 2, fontStyle: 'italic' }}>
                        "{selectedReport.treatmentConcerns}"
                      </Typography>
                    )}
                  </Box>

                  {selectedReport.requestDoctorContact && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                        Doctor Contact Requested:
                      </Typography>
                      <Chip label="Yes" color="warning" size="large" />
                      {selectedReport.contactMessage && (
                        <Typography variant="h6" sx={{ mt: 2, fontStyle: 'italic' }}>
                          Message: "{selectedReport.contactMessage}"
                        </Typography>
                      )}
                    </Box>
                  )}
                </Paper>

                {/* Report Metadata */}
                <Paper sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="h5" sx={{ color: '#877449', mb: 3, fontWeight: '600' }}>
                    Report Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Report ID</Typography>
                      <Typography variant="h6">{selectedReport.reportId}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Submitted Date</Typography>
                      <Typography variant="h6">{formatDate(selectedReport.createdAt)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Report Date</Typography>
                      <Typography variant="h6">{formatDate(selectedReport.reportDate)}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip 
                        label={selectedReport.complete ? 'Complete' : 'Incomplete'} 
                        color={selectedReport.complete ? 'success' : 'warning'}
                        size="large"
                      />
                    </Grid>
                    {selectedReport.reviewed && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Reviewed Date</Typography>
                          <Typography variant="h6">{formatDate(selectedReport.reviewedAt)}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">Review Status</Typography>
                          <Chip 
                            label="Reviewed" 
                            color="success"
                            size="large"
                            icon={<CheckCircle />}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Paper>

              </Stack>
            )}
          </Box>
        )}

      </Container>
    </>
  );
}
