'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Header from '../../components/Header';
import PageTitle from '../../components/PageTitle';
import { useConsultationAccess } from '../../hooks/useAccessControl';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  Grid,
  CardMedia,
  CardActionArea,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Paper,
  Pagination,
  Button,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Close as CloseIcon,
  VideoLibrary,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';

export default function MembershipPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useUser();
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalVideos: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const pageSize = 5;

  useConsultationAccess();

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    if (activeTab === 2 && user) {
      fetchVideos(currentPage);
    }
  }, [activeTab, currentPage, user]);

  const fetchVideos = async (page = 1) => {
    try {
      setVideosLoading(true);
      setVideosError(null);
      const response = await fetch(`/api/videos?page=${page}&pageSize=${pageSize}`);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos || []);
      setPagination(
        data.pagination || {
          totalVideos: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error('Error fetching videos:', error);
      setVideosError(error.message || 'Failed to load videos');
    } finally {
      setVideosLoading(false);
    }
  };

  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVideo(null);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <PageTitle
          title="Membership Area"
          subtitle="Exclusive resources and programs to support your long-term wellness journey."
        />

        <Card sx={{ backgroundColor: '#1a1a1a' }}>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                mb: 2,
                '& .MuiTabs-indicator': {
                  backgroundColor: '#877449',
                },
                '& .MuiTab-root': {
                  color: '#877449',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: '#877449',
                  },
                },
              }}
            >
              <Tab label="Partnerships" />
              <Tab label="Referral Program" />
              <Tab label="Tips and Advice" />
            </Tabs>

            <Divider sx={{ mb: 3 }} />

            {activeTab === 0 && (
              <Box>
                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                  As a member, you get access to preferred providers that complement your care plan and help you stay consistent between consultations.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                    Meal Prep and Delivery
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, color: 'text.secondary' }}>
                    Save time and reduce decision fatigue with trusted meal partners focused on portion-conscious, high-protein, nutrient-balanced options.
                  </Typography>
                  <List dense sx={{ pl: 1 }}>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText primary="Ready-to-eat and family-style plans for busy schedules" />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText primary="Menus aligned with weight management and blood sugar goals" />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText primary="Member-only offers and onboarding support where available" />
                    </ListItem>
                  </List>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: '1px solid #877449',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: '#877449', fontWeight: 600 }}>
                      NutriMotion: serving Kingston, St. Andrew and Portmore
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#877449', mt: 0.5 }}>
                      @nutri.motion
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#877449', mt: 0.5 }}>
                      Contact: Malik 876-428-2339
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      border: '1px solid #877449',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: '#877449', fontWeight: 600 }}>
                      Pirates Dock Bar & Grill: serving Westmoreland
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#877449', mt: 0.5 }}>
                      @piratesdock
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#877449', mt: 0.5 }}>
                      Contact: Gary 876-572-4902
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                    Fitness/Personal Trainer (Coming Soon)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, color: 'text.secondary' }}>
                    Build strength, improve energy, and preserve lean mass with trainers who understand lifestyle medicine and sustainable progress.
                  </Typography>
                  <List dense sx={{ pl: 1 }}>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText primary="Beginner-friendly and low-impact coaching options" />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText primary="Home, gym, and virtual session formats" />
                    </ListItem>
                    <ListItem sx={{ py: 0.5 }}>
                      <ListItemText primary="Programs tailored to your current goals and mobility level" />
                    </ListItem>
                  </List>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h5" sx={{ color: '#877449', mb: 1 }}>
                The Svelte Circle: “Your personalized path to lasting results.”
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                  Referral program details:
                </Typography>

                <Box sx={{ display: 'grid', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid #877449',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                      Svelte Select
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', paddingBottom: 2.0 }}>
                      Successful referral of 1 client  
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      - JMD$5500 account credit applied to a medication refill or sample meal option.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid #877449',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                      Svelte Signature
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', paddingBottom: 2.0, mb: 0.5 }}>
                      Successful referral of 3 clients 
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>  
                      - Svelte Select benefits.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      - Complimentary full day meal prep sample.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      - Early access to new programs, formulations, or services.
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid #877449',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                      Svelte Signature Plus
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', paddingBottom: 2.0, mb: 0.5 }}>
                      Successful referral of 6 clients
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      - Svelte Signature benefits.
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      - 5% monthly treatment discount (ongoing while status is maintained).
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      - Special perks for friends - 50% discount on consult fee.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h5" sx={{ color: '#877449', mb: 1 }}>
                  Tips and Advice
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
                  Small, repeatable habits drive the biggest long-term wins.
                </Typography>                

                <Divider sx={{ my: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#877449' }}>
                    <VideoLibrary sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Video Library
                  </Typography>
                  {pagination.totalVideos > 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.totalVideos)} of {pagination.totalVideos} videos
                    </Typography>
                  )}
                </Box>

                {videosError && (
                  <Paper sx={{ p: 2, mb: 2, backgroundColor: '#2A2A2A' }}>
                    <Typography variant="body2" color="error">
                      {videosError}
                    </Typography>
                  </Paper>
                )}

                {videosLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : videos.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#2A2A2A' }}>
                    <Typography variant="body1" color="text.secondary">
                      No videos available at this time.
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={2}>
                    {videos.map((video) => (
                      <Grid item xs={12} sm={6} md={4} key={video.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: '#000000',
                            border: '1px solid rgba(135, 116, 73, 0.35)',
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleVideoClick(video)}
                            sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}
                          >
                            <Box sx={{ position: 'relative', width: '100%' }}>
                              {video.thumbnail ? (
                                <CardMedia
                                  component="img"
                                  height="180"
                                  image={video.thumbnail}
                                  alt={video.name}
                                  sx={{ objectFit: 'cover', width: '100%' }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    height: 180,
                                    bgcolor: 'grey.900',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                  }}
                                >
                                  <PlayArrow sx={{ fontSize: 56, color: 'grey.600' }} />
                                </Box>
                              )}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                                  borderRadius: 1,
                                  px: 1,
                                  py: 0.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                <PlayArrow sx={{ color: 'white', fontSize: 20 }} />
                              </Box>
                            </Box>
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                  mb: 1,
                                  color: '#FFFFFF',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {video.name.replace(/\.[^/.]+$/, '')}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                                <Chip label={formatFileSize(video.size)} size="small" variant="outlined" />
                                <Chip label={formatDate(video.lastModified)} size="small" variant="outlined" />
                              </Box>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {!videosLoading && videos.length > 0 && pagination.totalPages > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button
                        variant="outlined"
                        startIcon={<ChevronLeft />}
                        onClick={handlePreviousPage}
                        disabled={!pagination.hasPreviousPage}
                      >
                        Previous
                      </Button>

                      <Pagination
                        count={pagination.totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />

                      <Button
                        variant="outlined"
                        endIcon={<ChevronRight />}
                        onClick={handleNextPage}
                        disabled={!pagination.hasNextPage}
                      >
                        Next
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'black',
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h6" component="span" sx={{ color: 'white' }}>
            {selectedVideo?.name.replace(/\.[^/.]+$/, '')}
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {selectedVideo && (
            <video
              controls
              autoPlay
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
              }}
              src={selectedVideo.downloadUrl}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
