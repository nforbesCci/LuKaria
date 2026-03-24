'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Script from 'next/script';
import SEO from '../../components/SEO';
import PublicTopMenu from '../../components/PublicTopMenu';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Grid,
  CircularProgress,
  Button,
  Pagination,
  Stack,
} from '@mui/material';
import { Article, Add, Login, OndemandVideo } from '@mui/icons-material';
import { getYouTubeVideoId } from '../../lib/business';
import { normalizePostVideos } from '../../lib/blog-videos';

const POSTS_PER_PAGE = 5;

/** @param {{ initialPosts?: Array }} props — from RSC; dates may be ISO strings */
export default function BlogPageClient({ initialPosts = [] }) {
  const { user } = useUser();
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [videoPage, setVideoPage] = useState(1);
  const [articlePage, setArticlePage] = useState(1);

  const isDoctorOrAdmin =
    user &&
    ((user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
      (user['https://lukariagroup.com/roles'] &&
        (user['https://lukariagroup.com/roles'].includes('Admin') ||
          user['https://lukariagroup.com/roles'].includes('Doctor'))));

  useEffect(() => {
    const loadPosts = () => {
      setLoading(true);
      fetch('/api/blog', { cache: 'no-store' })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => setPosts(Array.isArray(data) ? data : []))
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    if (initialPosts.length === 0) {
      loadPosts();
    }

    const handlePageShow = (e) => {
      if (e.persisted) loadPosts();
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  return (
    <>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
      )}
      <SEO
        title="Blog | Medical Weight Loss Jamaica | Svelte by LuKaria"
        description="Health and weight loss insights from Svelte by LuKaria. Doctor-guided care tips for GLP-1 weight loss, Ozempic, Mounjaro and healthy living."
        keywords="weight loss blog Jamaica, GLP-1 weight loss tips, medical weight loss insights, health blog, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com/blog"
      />
      <PublicTopMenu currentPath="/blog" />

      <Box
        sx={{
          position: 'fixed',
          top: 48,
          left: 0,
          right: 0,
          height: 64,
          backgroundColor: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          zIndex: 1000,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/images/Lukaria_logo_small.png"
            alt="Lukaria Logo"
            sx={{ width: 48, height: 48, objectFit: 'contain', display: { xs: 'none', sm: 'block' } }}
          />
          <Typography variant="h5" component="span" className="Svelte_logo">
            Svelte
          </Typography>
          <Typography variant="body1" component="span" className="svelte_post_script">
            by LuKaria
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!user ? (
            <Box
              onClick={() => (window.location.href = '/api/auth/login')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                backgroundColor: '#36454F',
                color: '#877449',
                borderRadius: 1,
                cursor: 'pointer',
                textTransform: 'none',
                minWidth: { xs: 'auto', sm: '64px' },
                '&:hover': { backgroundColor: '#2C3E50' },
              }}
            >
              <Login sx={{ fontSize: 20 }} />
              <Box>Sign-up/Login</Box>
            </Box>
          ) : (
            <Box
              onClick={() => (window.location.href = '/api/auth/logout')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                border: '1px solid #877449',
                color: '#877449',
                borderRadius: 1,
                cursor: 'pointer',
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(212,175,55,0.1)' },
              }}
            >
              Logout
            </Box>
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 16, mb: 6, px: 2 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 4,
            }}
          >
            <Typography variant="h3" sx={{ color: '#877449', fontFamily: 'sans-serif' }}>
              Blog
            </Typography>
            {isDoctorOrAdmin && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Article />}
                  href="/blog/new/article"
                  sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}
                >
                  New article
                </Button>
                <Button
                  variant="contained"
                  startIcon={<OndemandVideo />}
                  href="/blog/new/video"
                  sx={{ backgroundColor: '#B8941F', color: '#000', '&:hover': { backgroundColor: '#877449' } }}
                >
                  New video blog
                </Button>
                <Button
                  variant="text"
                  size="small"
                  component="a"
                  href="/blog/new"
                  startIcon={<Add />}
                  sx={{ color: '#877449', textTransform: 'none' }}
                >
                  Compare formats
                </Button>
              </Box>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#877449' }} />
            </Box>
          ) : posts.length === 0 ? (
            <Typography variant="body1" sx={{ color: '#877449', textAlign: 'center', py: 6 }}>
              No blog posts yet. Check back soon!
            </Typography>
          ) : (
            <>
              {(() => {
                const videoPosts = posts.filter((p) => normalizePostVideos(p).length > 0);
                const articlePosts = posts.filter((p) => normalizePostVideos(p).length === 0);
                const PostCard = ({ post, isVideo }) => {
                  const firstVideo = normalizePostVideos(post)[0];
                  const thumbId = firstVideo?.url ? getYouTubeVideoId(firstVideo.url) : null;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                      <Card
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#1a1a1a',
                          border: '1px solid #877449',
                        }}
                      >
                        <CardActionArea
                          component="a"
                          href={`/blog/${post._id}`}
                          sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                        >
                          {isVideo && thumbId ? (
                            <Box
                              sx={{
                                height: 180,
                                position: 'relative',
                                backgroundColor: '#000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Box
                                component="img"
                                src={`https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`}
                                alt={post.title}
                                sx={{ width: '100%', height: 180, objectFit: 'cover', opacity: 0.85 }}
                              />
                              <OndemandVideo
                                sx={{
                                  position: 'absolute',
                                  fontSize: 56,
                                  color: '#877449',
                                  filter: 'drop-shadow(0 0 4px #000)',
                                }}
                              />
                            </Box>
                          ) : post.imageUrl ? (
                            <CardMedia
                              component="img"
                              height="180"
                              image={post.imageUrl}
                              alt={post.title}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 180,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#2C3E50',
                              }}
                            >
                              <Article sx={{ fontSize: 64, color: '#877449' }} />
                            </Box>
                          )}
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="overline"
                              sx={{ color: isVideo ? '#B8941F' : '#877449', display: 'block', mb: 0.5 }}
                            >
                              {isVideo ? 'Video blog' : 'Article'}
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>
                              {post.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: '#877449',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {post.content}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#877449', opacity: 0.8, display: 'block', mt: 1 }}>
                              {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • {post.authorName}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                };
                return (
                  <>
                    {videoPosts.length > 0 && (
                      <Box sx={{ mb: 6 }}>
                        <Typography
                          variant="h4"
                          sx={{
                            color: '#877449',
                            fontFamily: 'sans-serif',
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <OndemandVideo sx={{ fontSize: 36 }} />
                          Video blogs
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#877449', opacity: 0.9, mb: 3 }}>
                          Video-first posts with embedded YouTube from our team (a separate format from articles).
                        </Typography>
                        <Grid container spacing={3}>
                          {videoPaginated.map((post) => (
                            <PostCard key={post._id} post={post} isVideo />
                          ))}
                        </Grid>
                        {videoPages > 1 && (
                          <Stack alignItems="center" sx={{ mt: 3 }}>
                            <Pagination
                              count={videoPages}
                              page={videoPage}
                              onChange={(_, p) => setVideoPage(p)}
                              color="primary"
                              sx={{
                                '& .MuiPaginationItem-root': { color: '#877449' },
                                '& .Mui-selected': { color: '#000', backgroundColor: '#877449' },
                                '& .MuiPaginationItem-root:hover': { backgroundColor: 'rgba(212,175,55,0.2)' },
                              }}
                            />
                          </Stack>
                        )}
                      </Box>
                    )}
                    {articlePosts.length > 0 && (
                      <Box>
                        <Typography variant="h4" sx={{ color: '#877449', fontFamily: 'sans-serif', mb: 3 }}>
                          Articles
                        </Typography>
                        <Grid container spacing={3}>
                          {articlePaginated.map((post) => (
                            <PostCard key={post._id} post={post} isVideo={false} />
                          ))}
                        </Grid>
                        {articlePages > 1 && (
                          <Stack alignItems="center" sx={{ mt: 3 }}>
                            <Pagination
                              count={articlePages}
                              page={articlePage}
                              onChange={(_, p) => setArticlePage(p)}
                              color="primary"
                              sx={{
                                '& .MuiPaginationItem-root': { color: '#877449' },
                                '& .Mui-selected': { color: '#000', backgroundColor: '#877449' },
                                '& .MuiPaginationItem-root:hover': { backgroundColor: 'rgba(212,175,55,0.2)' },
                              }}
                            />
                          </Stack>
                        )}
                      </Box>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </Container>
      </Box>
    </>
  );
}
