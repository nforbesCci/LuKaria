'use client';

import PublicTopMenu from '../../components/PublicTopMenu';
import PublicTopBar from '../../components/PublicTopBar';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';

export default function Glp1WeightLossPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: 'Doctor-guided GLP-1 weight loss',
    procedureType: 'Medical weight management',
    bodyLocation: 'Whole-body metabolic regulation',
    provider: {
      '@type': 'MedicalOrganization',
      name: 'Svelte by LuKaria',
      url: 'https://www.lukariagroup.com',
      areaServed: {
        '@type': 'Country',
        name: 'Jamaica',
      },
    },
    url: 'https://www.lukariagroup.com/glp-1-weight-loss',
    description:
      'Physician-supervised GLP-1 weight loss treatment plans in Jamaica with telehealth follow-up and individualized dosing guidance.',
  };

  return (
    <>
      <PublicTopMenu currentPath="/glp-1-weight-loss" />
      <PublicTopBar />
      <Container maxWidth="lg" sx={{ mt: 14, mb: 8 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Box sx={{ mb: 4 }}>
        <Typography component="h1" variant="h3" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
          GLP-1 Weight Loss Jamaica
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', maxWidth: 900 }}>
          Svelte by LuKaria provides doctor-guided GLP-1 treatment plans for adults in Jamaica. Every plan is
          personalized and medically supervised by Dr. Kadria Fairclough with virtual follow-up.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
            <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
              How it works
            </Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>
              GLP-1 medications help regulate appetite and support healthier metabolic patterns when paired with
              physician-led lifestyle changes.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
            <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
              Who may benefit
            </Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>
              Adults who need evidence-based weight management and want safe, ongoing medical monitoring with a
              personalized plan.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
            <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
              Ongoing support
            </Typography>
            <Typography variant="body2" sx={{ color: '#333' }}>
              Regular virtual reviews, treatment adjustments, and clinician guidance keep care safe and aligned with
              your goals.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3, borderColor: '#877449', mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#877449', mb: 1 }}>
          A message from Dr. Fairclough
        </Typography>
        <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75 }}>
          &quot;Our goal is sustainable progress, not quick fixes. We use medical history, goals, and ongoing
          check-ins to tailor GLP-1 treatment safely for each patient.&quot;
        </Typography>
      </Paper>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component="a"
            href="https://calendly.com/kadriaf-lukariagroup/30min"
            variant="contained"
            sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}
          >
            Book a consultation
          </Button>
          <Button component="a" href="/faq" variant="outlined" sx={{ borderColor: '#877449', color: '#877449' }}>
            Read FAQ
          </Button>
        </Box>
      </Container>
    </>
  );
}
