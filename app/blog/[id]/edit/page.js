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
  IconButton,
  Paper,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { normalizePostVideos, isVideoBlogPost } from '../../../../lib/blog-videos';

const emptyVideoRow = () => ({ title: '', url: '' });

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [videoEntries, setVideoEntries] = useState([emptyVideoRow()]);
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

  const isVideoMode = post ? isVideoBlogPost(post) : false;

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
        const vlist = normalizePostVideos(data);
        setVideoEntries(
          vlist.length ? vlist.map((v) => ({ title: v.title || '', url: v.url || '' })) : [emptyVideoRow()]
        );
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post');
        setLoading(false);
      });
  }, [params?.id, user, isDoctorOrAdmin]);

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

  const handleSubmitArticle = async (e) => {
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

  const handleConvertToArticle = async () => {
    if (!confirm('Convert this post to a text article? All embedded videos will be removed from the post.')) return;
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('postKind', 'article');
      formData.append('videosJson', JSON.stringify([]));
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

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    const payload = videoEntries
      .filter((v) => v.url.trim())
      .map((v) => ({ title: v.title.trim(), url: v.url.trim() }));
    if (payload.length === 0) {
      setError('Video blogs require at least one valid YouTube URL.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      formData.append('postKind', 'video');
      formData.append('videosJson', JSON.stringify(payload));
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

  if (isVideoMode) {
    return (
      <Container maxWidth="md" sx={{ mt: 14, mb: 6 }}>
        <Typography variant="overline" sx={{ color: '#B8941F', display: 'block', mb: 0.5 }}>
          Video blog
        </Typography>
        <Typography variant="h4" sx={{ color: '#877449', mb: 1 }}>Edit video blog</Typography>
        <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
          This post uses the video blog format. You can convert it to a text-only article (videos removed) using the button below.
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmitVideo}>
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
            rows={8}
            label="Supporting text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" sx={{ color: '#B8941F', fontWeight: 600, mb: 1 }}>
            Videos (required)
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
            At least one valid YouTube URL must remain for this format.
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
                value={row.title}
                onChange={(e) => setVideoField(index, 'title', e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="YouTube URL or video ID"
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
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button type="submit" variant="contained" disabled={saving} sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" onClick={() => router.push(`/blog/${params.id}`)} sx={{ borderColor: '#877449', color: '#877449' }}>
              Cancel
            </Button>
            <Button type="button" variant="text" disabled={saving} onClick={handleConvertToArticle} sx={{ color: '#999' }}>
              Convert to article…
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 14, mb: 6 }}>
      <Typography variant="overline" sx={{ color: '#877449', display: 'block', mb: 0.5 }}>
        Article
      </Typography>
      <Typography variant="h4" sx={{ color: '#877449', mb: 1 }}>Edit article</Typography>
      <Typography variant="body2" sx={{ color: '#999', mb: 2 }}>
        Text-only post. To embed YouTube videos as a video blog, create a{' '}
        <Button size="small" href="/blog/new/video" sx={{ color: '#B8941F', textTransform: 'none', p: 0, minWidth: 0, verticalAlign: 'baseline' }}>
          new video blog
        </Button>
        .
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmitArticle}>
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
