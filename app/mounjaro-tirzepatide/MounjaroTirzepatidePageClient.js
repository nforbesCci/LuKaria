'use client';

import PublicTopMenu from '../../components/PublicTopMenu';
import PublicTopBar from '../../components/PublicTopBar';
import GlpPagesDisclaimer from '../../components/marketing/GlpPagesDisclaimer';
import GlpVirtualProgramSection from '../../components/marketing/GlpVirtualProgramSection';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';

export default function MounjaroTirzepatidePageClient() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: 'Doctor-guided tirzepatide (Mounjaro) weight loss',
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
    url: 'https://www.lukariagroup.com/mounjaro-tirzepatide',
    description:
      'Physician-supervised tirzepatide weight management in Jamaica—virtual follow-up and individualized planning with Dr. Kadria Fairclough.',
  };

  return (
    <>
      <PublicTopMenu currentPath="/mounjaro-tirzepatide" />
      <PublicTopBar />
      <Container maxWidth="lg" sx={{ mt: 14, mb: 8 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Box sx={{ mb: 4 }}>
          <Typography component="h1" variant="h3" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
            Mounjaro &amp; tirzepatide weight loss Jamaica
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', maxWidth: 900 }}>
            Tirzepatide works on GLP-1 and GIP pathways and is prescribed alongside nutrition and activity changes for chronic
            weight management in selected adults. Svelte by LuKaria provides medically supervised plans—including Mounjaro
            when appropriate—with telehealth follow-up.
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
              <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                How it works
              </Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>
                Tirzepatide helps regulate blood sugar and appetite and affects how energy is stored—always as part of a
                broader plan directed by your physician.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
              <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                Who may benefit
              </Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>
                Adults who meet clinical criteria after assessment and want structured, monitored care. Only your
                prescribing doctor can decide if tirzepatide is right for you.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2.5, height: '100%', borderColor: '#877449' }}>
              <Typography variant="h6" sx={{ color: '#877449', mb: 1 }}>
                Ongoing support
              </Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>
                Virtual visits, monitoring, and plan updates help keep therapy safe and effective over time.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 3, borderColor: '#877449', mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#877449', mb: 1 }}>
            A message from Dr. Fairclough
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75 }}>
            &quot;Our goal is sustainable progress, not quick fixes. We use medical history, goals, and ongoing check-ins
            to tailor treatment safely for each patient—whether that includes tirzepatide or another approach.&quot;
        </Typography>
      </Paper>

      <GlpVirtualProgramSection />

      <Paper variant="outlined" sx={{ p: 3, borderColor: '#877449', mb: 4 }}>
        <Typography variant="h5" sx={{ color: '#877449', mb: 2 }}>
          Who may be a good candidate?
        </Typography>
          <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, mb: 2 }}>
            GLP-1 medications can be a helpful option for many people, but they are not for everyone, and that&apos;s okay.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, mb: 2 }}>
            You may be a good candidate for medically supervised GLP-1 medications if you are living with excess weight or
            obesity-related health concerns, and you are ready to approach weight loss as a structured, medically guided
            process. This means being open to ongoing follow-up, lifestyle changes, and honest conversations about both the
            benefits and the risks. Some persons may need a different approach, or closer monitoring. If you are exploring
            options for weight loss in Jamaica, one of the safest options is a licensed physician who can complete an
            adequate assessment, explain options, and make adjustments to your care as your needs evolve.
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>
            Before starting GLP-1 therapy your doctor will need a clear understanding of your health history. It&apos;s
            especially important that you share:
          </Typography>
          <Typography variant="subtitle2" sx={{ color: '#877449', mb: 1 }}>
            Medical history:
          </Typography>
          <Box
            component="ul"
            sx={{
              m: 0,
              pl: 2.5,
              color: '#333',
              '& li': { mb: 1.25, lineHeight: 1.75 },
            }}
          >
            <Typography component="li" variant="body1">
              Medullary thyroid cancer or family history of medullary thyroid cancer
            </Typography>
            <Typography component="li" variant="body1">
              Gallbladder disease, pancreatitis, or severe gastrointestinal disease
            </Typography>
            <Typography component="li" variant="body1">
              History of Multiple Endocrine Neoplasia type 2 (MEN 2) or family history of MEN 2
            </Typography>
            <Typography component="li" variant="body1">
              Whether you are pregnant, planning to become pregnant, or breastfeeding
            </Typography>
            <Typography component="li" variant="body1">
              Previous or upcoming surgeries (including bariatric surgeries)
            </Typography>
            <Typography component="li" variant="body1">
              All prescription and over-the-counter medications
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.75, mt: 2 }}>
            This isn&apos;t about excluding persons, it&apos;s about ensuring your care is safe, appropriate, and truly
            tailored to you.
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
          <Button component="a" href="/faq?glp=tirzepatide" variant="outlined" sx={{ borderColor: '#877449', color: '#877449' }}>
            Tirzepatide FAQ
          </Button>
          <Button component="a" href="/glp-1-weight-loss" variant="text" sx={{ color: '#877449' }}>
            All GLP-1 options
          </Button>
        </Box>
        <GlpPagesDisclaimer />
      </Container>
    </>
  );
}
