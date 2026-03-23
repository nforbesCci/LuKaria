'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Article, OndemandVideo } from '@mui/icons-material';

export default function BlogNewChooserPage() {
  const router = useRouter();
  const { user } = useUser();

  const isDoctorOrAdmin = user && (
    (user.groups && (user.groups.includes('Admin') || user.groups.includes('Doctor'))) ||
    (user['https://lukariagroup.com/roles'] && (
      user['https://lukariagroup.com/roles'].includes('Admin') ||
      user['https://lukariagroup.com/roles'].includes('Doctor')
    ))
  );

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
      <Typography variant="h4" sx={{ color: '#877449', mb: 1 }}>
        New blog post
      </Typography>
      <Typography variant="body1" sx={{ color: '#877449', opacity: 0.95, mb: 4 }}>
        Choose how you want to publish: a written article, or a video blog with embedded YouTube video(s). These are two different formats—not an optional add-on.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 3,
        }}
      >
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 3,
            borderColor: '#877449',
            borderWidth: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#1a1a1a',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Article sx={{ fontSize: 40, color: '#877449' }} />
            <Typography variant="h6" sx={{ color: '#877449', fontWeight: 700 }}>
              Article
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#ccc', flexGrow: 1 }}>
            Text-focused post with optional header image. Shown under &quot;Articles&quot; on the blog.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            href="/blog/new/article"
            sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}
          >
            Create article
          </Button>
        </Paper>

        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 3,
            borderColor: '#B8941F',
            borderWidth: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            backgroundColor: '#1a1a1a',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <OndemandVideo sx={{ fontSize: 40, color: '#B8941F' }} />
            <Typography variant="h6" sx={{ color: '#B8941F', fontWeight: 700 }}>
              Video blog
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#ccc', flexGrow: 1 }}>
            Post built around one or more YouTube embeds plus supporting text. Shown under &quot;Video blogs&quot; on the blog.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            href="/blog/new/video"
            sx={{ backgroundColor: '#B8941F', color: '#000', '&:hover': { backgroundColor: '#877449' } }}
          >
            Create video blog
          </Button>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Button variant="text" onClick={() => router.push('/blog')} sx={{ color: '#877449' }}>
          ← Back to blog
        </Button>
      </Box>
    </Container>
  );
}
