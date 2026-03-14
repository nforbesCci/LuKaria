'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Script from 'next/script';
import SEO from '../../../components/SEO';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
} from '@mui/material';
import { Article, Delete, Login } from '@mui/icons-material';

export default function BlogPostPage() {
  const params = useParams();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentName, setCommentName] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isDoctorOrAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (
      user['https://lukariagroup.com/roles'].includes('Admin') ||
      user['https://lukariagroup.com/roles'].includes('Doctor')
    ))
  );

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/blog/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentName.trim() || !commentContent.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/blog/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: commentName.trim(), content: commentContent.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post comment');
      setPost((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), { ...data.comment, id: data.comment.id }],
      }));
      setCommentName('');
      setCommentContent('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Remove this comment?')) return;
    try {
      const res = await fetch(`/api/blog/${params.id}/comments?commentId=${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove comment');
      setPost((prev) => ({
        ...prev,
        comments: (prev.comments || []).filter((c) => c.id !== commentId),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading || !post) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#877449' }} />
      </Box>
    );
  }

  return (
    <>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
      )}
      <SEO
        title={`${post.title} | Blog | Svelte by LuKaria`}
        description={post.content?.slice(0, 160) || 'Blog post from Svelte by LuKaria'}
        canonical={`https://www.lukariagroup.com/blog/${post._id}`}
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
          <Typography variant="body2" sx={{ color: '#000', fontWeight: '600', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => (window.location.href = '/blog')}>Blog</Typography>
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
        <Container maxWidth="md">
          <Paper elevation={2} sx={{ p: 4, backgroundColor: '#1a1a1a' }}>
            {post.imageUrl && (
              <Box
                component="img"
                src={post.imageUrl}
                alt={post.title}
                sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 1, mb: 3 }}
              />
            )}
            <Typography variant="h4" sx={{ color: '#877449', fontWeight: 600, mb: 2 }}>
              {post.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#877449', opacity: 0.8, mb: 3 }}>
              {new Date(post.createdAt).toLocaleDateString()} • {post.authorName}
            </Typography>
            <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {post.content}
            </Typography>

            {isDoctorOrAdmin && (
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  href={`/blog/${post._id}/edit`}
                  sx={{ borderColor: '#877449', color: '#877449', '&:hover': { borderColor: '#B8941F', backgroundColor: 'rgba(212,175,55,0.1)' } }}
                >
                  Edit Post
                </Button>
              </Box>
            )}
          </Paper>

          {/* Comments */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" sx={{ color: '#877449', fontWeight: 600, mb: 2 }}>
              Comments
            </Typography>

            {success && <Alert severity="success" sx={{ mb: 2 }}>Comment posted!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper elevation={2} sx={{ p: 3, mb: 3, backgroundColor: '#1a1a1a' }}>
              <Typography variant="subtitle2" sx={{ color: '#877449', mb: 2 }}>Leave a comment (no login required)</Typography>
              <Box component="form" onSubmit={handleSubmitComment}>
                <TextField
                  fullWidth
                  label="Your name"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#877449' }, '& .MuiInputLabel-root': { color: '#877449' } }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Comment"
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  required
                  sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: '#877449' }, '& .MuiInputLabel-root': { color: '#877449' } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </Paper>

            {(post.comments || []).length === 0 ? (
              <Typography variant="body2" sx={{ color: '#877449', opacity: 0.8 }}>No comments yet. Be the first!</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {post.comments.map((c) => (
                  <Paper key={c.id} elevation={1} sx={{ p: 2, backgroundColor: '#2C3E50', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#877449', fontWeight: 600 }}>{c.authorName}</Typography>
                      <Typography variant="body2" sx={{ color: '#877449', mt: 0.5 }}>{c.content}</Typography>
                      <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7 }}>{new Date(c.createdAt).toLocaleString()}</Typography>
                    </Box>
                    {isDoctorOrAdmin && (
                      <IconButton size="small" onClick={() => handleDeleteComment(c.id)} sx={{ color: '#877449' }} title="Remove comment">
                        <Delete />
                      </IconButton>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
}
