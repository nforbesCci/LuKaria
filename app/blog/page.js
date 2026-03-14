'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Script from 'next/script';
import SEO from '../../components/SEO';
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
} from '@mui/material';
import { Article, Add, Login } from '@mui/icons-material';

export default function BlogPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDoctorOrAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (
      user['https://lukariagroup.com/roles'].includes('Admin') ||
      user['https://lukariagroup.com/roles'].includes('Doctor')
    ))
  );

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      {/* Top Navigation Menu */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: '#877449',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          zIndex: 1001,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => (window.location.href = '/')}>Home</Typography>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => (window.location.href = '/info')}>Info</Typography>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => (window.location.href = '/faq')}>FAQ</Typography>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => (window.location.href = '/contact')}>Contact</Typography>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => (window.location.href = '/about')}>About Us</Typography>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', textDecoration: 'underline' }}>Blog</Typography>
        </Box>
      </Box>

      {/* Top Navigation Bar - Logo and Login */}
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
          <Box component="img" src="/images/Lukaria_logo_small.png" alt="Lukaria Logo" sx={{ width: 48, height: 48, objectFit: 'contain', display: { xs: 'none', sm: 'block' } }} />
          <Typography variant="h5" component="span" className="Svelte_logo">Svelte</Typography>
          <Typography variant="body1" component="span" className="svelte_post_script">by LuKaria</Typography>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Typography variant="h3" sx={{ color: '#877449', fontFamily: 'sans-serif' }}>
              Blog
            </Typography>
            {isDoctorOrAdmin && (
              <Button
                variant="contained"
                startIcon={<Add />}
                href="/blog/new"
                sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}
              >
                New Post
              </Button>
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
            <Grid container spacing={3}>
              {posts.map((post) => (
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
                      {post.imageUrl ? (
                        <CardMedia
                          component="img"
                          height="180"
                          image={post.imageUrl}
                          alt={post.title}
                          sx={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C3E50' }}>
                          <Article sx={{ fontSize: 64, color: '#877449' }} />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>
                          {post.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#877449', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {post.content}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.8, display: 'block', mt: 1 }}>
                          {new Date(post.createdAt).toLocaleDateString()} • {post.authorName}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </>
  );
}
