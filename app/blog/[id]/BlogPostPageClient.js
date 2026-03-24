'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Script from 'next/script';
import SEO from '../../../components/SEO';
import PublicTopMenu from '../../../components/PublicTopMenu';
import { getYouTubeEmbedUrl, getYouTubeVideoId } from '../../../lib/business';
import { normalizePostVideos, isVideoBlogPost } from '../../../lib/blog-videos';
import { toIsoDateString } from '../../../lib/seo-helpers';
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
import { Delete, Login } from '@mui/icons-material';

export default function BlogPostPageClient({ initialPost }) {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState(initialPost ?? null);
  const [loading, setLoading] = useState(!initialPost);
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
    if (initialPost) return;
    if (!params?.id) return;
    fetch(`/api/blog/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id, initialPost]);

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

  const handleDeletePost = async () => {
    if (!confirm('Delete this blog post? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/blog/${params.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete post');
      router.push('/blog');
    } catch (err) {
      setError(err.message || 'Failed to delete post');
    }
  };

  if (loading || !post) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#877449' }} />
      </Box>
    );
  }

  const postVideos = normalizePostVideos(post);
  const isVideoBlog = isVideoBlogPost(post);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            '@id': `https://www.lukariagroup.com/blog/${post._id}#article`,
            headline: post.title,
            description: post.content?.slice(0, 160),
            url: `https://www.lukariagroup.com/blog/${post._id}`,
            inLanguage: 'en-JM',
            articleSection: isVideoBlog ? 'Video blog' : 'Articles',
            datePublished: toIsoDateString(post.createdAt),
            dateModified: toIsoDateString(post.updatedAt || post.createdAt),
            author: {
              '@type': 'Person',
              name: post.authorName || 'Doctor',
              ...(post.authorName && /kadria fairclough/i.test(post.authorName)
                ? { url: 'https://www.lukariagroup.com/about' }
                : {}),
            },
            publisher: {
              '@type': 'Organization',
              name: 'Svelte by LuKaria',
              url: 'https://www.lukariagroup.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.lukariagroup.com/images/Lukaria_logo.png',
              },
            },
            isPartOf: {
              '@type': 'WebSite',
              '@id': 'https://www.lukariagroup.com/#website',
              name: 'Svelte by LuKaria',
              url: 'https://www.lukariagroup.com',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://www.lukariagroup.com/blog/${post._id}`,
            },
            ...((post.imageUrl || (isVideoBlog && postVideos[0]?.url)) && {
              image: {
                '@type': 'ImageObject',
                url: post.imageUrl
                  ? `https://www.lukariagroup.com${post.imageUrl}`
                  : `https://img.youtube.com/vi/${getYouTubeVideoId(postVideos[0].url)}/mqdefault.jpg`,
              },
            }),
            ...(postVideos.length > 0 && {
              associatedMedia: postVideos.map((v) => ({
                '@type': 'VideoObject',
                name: v.title || post.title,
                embedUrl: getYouTubeEmbedUrl(v.url),
                ...(getYouTubeVideoId(v.url) && {
                  thumbnailUrl: `https://img.youtube.com/vi/${getYouTubeVideoId(v.url)}/mqdefault.jpg`,
                }),
              })),
            }),
          }),
        }}
      />
      <PublicTopMenu currentPath="/blog" />

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
            <Typography variant="overline" sx={{ color: isVideoBlog ? '#B8941F' : '#877449', display: 'block', mb: 1 }}>
              {isVideoBlog ? 'Video blog' : 'Article'}
            </Typography>
            <Typography variant="h4" sx={{ color: '#877449', fontWeight: 600, mb: 2 }}>
              {post.title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#877449', opacity: 0.8, mb: 3 }}>
              {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • {post.authorName}
            </Typography>
            {postVideos.map((v, idx) =>
              getYouTubeEmbedUrl(v.url) ? (
                <Box key={`${v.url}-${idx}`} sx={{ mb: 3 }}>
                  {v.title ? (
                    <Typography variant="h6" sx={{ color: '#877449', fontWeight: 600, mb: 1.5 }}>
                      {v.title}
                    </Typography>
                  ) : null}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      pt: '56.25%',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: '#000',
                    }}
                  >
                    <Box
                      component="iframe"
                      src={getYouTubeEmbedUrl(v.url)}
                      title={v.title || `Video ${idx + 1}: ${post.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    />
                  </Box>
                </Box>
              ) : null
            )}
            {post.imageUrl && (
              <Box
                component="img"
                src={post.imageUrl}
                alt={post.title}
                sx={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 1, mb: 3 }}
              />
            )}
            <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {post.content}
            </Typography>

            {isDoctorOrAdmin && (
              <Box sx={{ mt: 3, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  href={`/blog/${post._id}/edit`}
                  sx={{ borderColor: '#877449', color: '#877449', '&:hover': { borderColor: '#B8941F', backgroundColor: 'rgba(212,175,55,0.1)' } }}
                >
                  Edit Post
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeletePost}
                >
                  Delete Post
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
                      <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7 }}>{new Date(c.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</Typography>
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
