'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function BlogNewArticlePage() {
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDoctorOrAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (
      user['https://lukariagroup.com/roles'].includes('Admin') ||
      user['https://lukariagroup.com/roles'].includes('Doctor')
    ))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('postKind', 'article');
      formData.append('videosJson', JSON.stringify([]));
      if (imageFile) formData.append('image', imageFile);
      const res = await fetch('/api/blog', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');
      router.push(`/blog/${data.slug || data.id}`);
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
          Access denied. Doctor or Admin role required to create blog posts.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 14, mb: 6 }}>
      <Typography variant="overline" sx={{ color: '#877449', display: 'block', mb: 0.5 }}>
        Article
      </Typography>
      <Typography variant="h4" sx={{ color: '#877449', mb: 1 }}>New article</Typography>
      <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
        Written post only. For posts centered on YouTube video(s), use{' '}
        <Button size="small" href="/blog/new/video" sx={{ color: '#B8941F', textTransform: 'none', p: 0, minWidth: 0, verticalAlign: 'baseline' }}>
          New video blog
        </Button>
        {' '}instead.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Post title"
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
          <Typography variant="body2" sx={{ mb: 1 }}>Image (optional)</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button type="submit" variant="contained" disabled={saving} sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}>
            {saving ? 'Creating...' : 'Create article'}
          </Button>
          <Button variant="outlined" onClick={() => router.push('/blog/new')} sx={{ borderColor: '#877449', color: '#877449' }}>
            Choose another format
          </Button>
          <Button variant="text" onClick={() => router.push('/blog')} sx={{ color: '#877449' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
