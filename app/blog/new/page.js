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
  IconButton,
  Paper,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const emptyVideoRow = () => ({ title: '', url: '' });

export default function BlogNewPage() {
  const router = useRouter();
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoEntries, setVideoEntries] = useState([emptyVideoRow()]);
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

  const addVideoRow = () => setVideoEntries((rows) => [...rows, emptyVideoRow()]);
  const removeVideoRow = (index) => {
    setVideoEntries((rows) =>
      rows.length <= 1 ? [emptyVideoRow()] : rows.filter((_, j) => j !== index)
    );
  };
  const setVideoField = (index, field, value) => {
    setVideoEntries((rows) => {
      const next = [...rows];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    setError('');
    try {
      const payload = videoEntries
        .filter((v) => v.url.trim())
        .map((v) => ({ title: v.title.trim(), url: v.url.trim() }));
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('videosJson', JSON.stringify(payload));
      if (imageFile) formData.append('image', imageFile);
      const res = await fetch('/api/blog', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');
      router.push(`/blog/${data.id}`);
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
      <Typography variant="h4" sx={{ color: '#877449', mb: 3 }}>New Blog Post</Typography>
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

        <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>
          Video blogs (optional)
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Add one or more YouTube URLs with a title for each video. Posts with at least one valid video appear under &quot;Video blogs&quot; on the blog index.
        </Typography>
        {videoEntries.map((row, index) => (
          <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, borderColor: '#877449' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#877449', fontWeight: 600 }}>
                Video {index + 1}
              </Typography>
              <IconButton size="small" onClick={() => removeVideoRow(index)} aria-label="Remove video" sx={{ color: '#877449' }}>
                <Delete />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              label="Video title"
              placeholder="e.g. Introduction to our weight loss program"
              value={row.title}
              onChange={(e) => setVideoField(index, 'title', e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="YouTube URL or video ID"
              placeholder="https://www.youtube.com/watch?v=... or 11-character ID"
              value={row.url}
              onChange={(e) => setVideoField(index, 'url', e.target.value)}
            />
          </Paper>
        ))}
        <Button
          type="button"
          startIcon={<Add />}
          onClick={addVideoRow}
          sx={{ mb: 3, color: '#877449', borderColor: '#877449' }}
          variant="outlined"
        >
          Add another video
        </Button>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>Image (optional)</Typography>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={saving} sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}>
            {saving ? 'Creating...' : 'Create Post'}
          </Button>
          <Button variant="outlined" onClick={() => router.push('/blog')} sx={{ borderColor: '#877449', color: '#877449' }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
