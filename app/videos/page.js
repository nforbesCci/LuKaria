'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
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

export default function Videos() {
  const { user, isLoading: userLoading } = useUser();
  const router = useRouter();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
    }
  }, [user, userLoading, router]);

  // Fetch videos when page changes
  useEffect(() => {
    if (user && !userLoading) {
      fetchVideos(currentPage);
    }
  }, [user, userLoading, currentPage]);

  const fetchVideos = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/videos?page=${page}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
      setPagination(data.pagination || {
        totalVideos: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  if (userLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            <VideoLibrary sx={{ mr: 1, verticalAlign: 'middle' }} />
            Videos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse and watch educational videos from our library
          </Typography>
          {pagination.totalVideos > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, pagination.totalVideos)} of {pagination.totalVideos} videos
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : videos.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No videos available at this time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Check back later for new content
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item xs={12} sm={6} md={4} key={video.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
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
                          height="200"
                          image={video.thumbnail}
                          alt={video.name}
                          sx={{
                            objectFit: 'cover',
                            width: '100%',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 200,
                            bgcolor: 'grey.300',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                          }}
                        >
                          <PlayArrow sx={{ fontSize: 60, color: 'grey.600' }} />
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
                        component="h2"
                        sx={{
                          mb: 1,
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
                        <Chip
                          label={formatFileSize(video.size)}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={formatDate(video.lastModified)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination Controls */}
        {!loading && videos.length > 0 && pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
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

        {/* Video Player Dialog */}
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
            <IconButton
              onClick={handleCloseDialog}
              sx={{ color: 'white' }}
              size="small"
            >
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
      </Container>
    </>
  );
}

