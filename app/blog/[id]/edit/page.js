'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDoctorOrAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (
      user['https://lukariagroup.com/roles'].includes('Admin') ||
      user['https://lukariagroup.com/roles'].includes('Doctor')
    ))
  );

  useEffect(() => {
    if (!params?.id || !user) return;
    if (!isDoctorOrAdmin) {
      setError('Access denied. Doctor or Admin required.');
      setLoading(false);
      return;
    }
    fetch(`/api/blog/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setTitle(data.title || '');
        setContent(data.content || '');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post');
        setLoading(false);
      });
  }, [params?.id, user, isDoctorOrAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      if (imageFile) formData.append('image', imageFile);
      const res = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
      router.push(`/blog/${params.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#877449' }} />
      </Box>
    );
  }

  if (!isDoctorOrAdmin) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error" action={<Button color="inherit" size="small" href="/api/auth/login">Log in</Button>}>
          Access denied. Doctor or Admin role required to edit blog posts.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#877449' }} />
      </Box>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">Post not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 14, mb: 6 }}>
      <Typography variant="h4" sx={{ color: '#877449', mb: 3 }}>Edit Blog Post</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          multiline
          rows={10}
          label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Image (optional - leave blank to keep current)</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {post.imageUrl && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Current: {post.imageUrl}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={saving} sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outlined" onClick={() => router.push(`/blog/${params.id}`)} sx={{ borderColor: '#877449', color: '#877449' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
