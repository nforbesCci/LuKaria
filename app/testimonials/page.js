'use client';

import PublicTopMenu from '../../components/PublicTopMenu';
import PublicTopBar from '../../components/PublicTopBar';
import { Container, Typography, Box, Grid, Paper, Alert } from '@mui/material';

const TESTIMONIALS = [
  {
    quote:
      'I finally felt heard about my weight, not judged. The plan was clear and follow-ups helped me stay consistent.',
    source: 'Shared with patient consent',
  },
  {
    quote:
      'Virtual visits fit my schedule. Having a physician oversee progress and treatment changes made me feel safe.',
    source: 'Shared with patient consent',
  },
  {
    quote:
      'Professional and compassionate care. I now understand my options and what sustainable progress looks like.',
    source: 'Shared with patient consent',
  },
];

export default function TestimonialsPage() {
  return (
    <>
      <PublicTopMenu currentPath="/testimonials" />
      <PublicTopBar />
      <Container maxWidth="lg" sx={{ mt: 14, mb: 8 }}>
        <Box sx={{ mb: 4 }}>
        <Typography component="h1" variant="h3" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
          Patient Testimonials
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', maxWidth: 900 }}>
          Real feedback from patients who agreed to share their experience with Svelte by LuKaria. Individual results
          vary and each treatment plan is personalized.
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Testimonials are anonymized to protect patient privacy and are shared with consent.
      </Alert>

        <Grid container spacing={3}>
          {TESTIMONIALS.map((item, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, fontStyle: 'italic' }}>
                  &quot;{item.quote}&quot;
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: '#666' }}>
                  - {item.source}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}
