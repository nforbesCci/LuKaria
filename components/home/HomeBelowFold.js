'use client';

import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
} from '@mui/material';
import BookingButton from '../BookingButton';
import {
  Star,
  ChatBubbleOutline,
  Medication,
  HealthAndSafety,
  VideoCall,
  Security,
  Assignment,
} from '@mui/icons-material';

/**
 * Below-the-fold sections code-split to reduce initial JS and improve LCP/TBT.
 */
export default function HomeBelowFold() {
  return (
    <Box component="section" className="home-snap-section" sx={{ width: '100%' }}>
      {/* Patient experiences */}
      <Box sx={{ width: '100%', backgroundColor: '#faf8f5', py: 6, px: 2 }}>
        <Container maxWidth="lg">
          <Typography component="h2" variant="h4" sx={{ color: '#000', fontFamily: 'serif', fontWeight: 600, textAlign: 'center', mb: 1 }}>
            What patients say
          </Typography>
          <Typography variant="body2" sx={{ color: '#555', textAlign: 'center', mb: 4, maxWidth: 720, mx: 'auto' }}>
            The following are anonymized comments from patients who agreed to share feedback. Individual results vary; your clinician will discuss what is realistic for you.
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <Star sx={{ fontSize: 22, color: '#877449', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &ldquo;I finally felt heard about my weight—not judged. The plan was clear and the follow-ups kept me on track.&rdquo;
                </Typography>
                <Typography variant="caption" sx={{ color: '#777', display: 'block', mt: 1.5 }}>
                  — (shared with consent)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <Star sx={{ fontSize: 22, color: '#877449', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &ldquo;Virtual visits fit my schedule. I appreciate having a physician oversee my progress and adjust treatment safely.&rdquo;
                </Typography>
                <Typography variant="caption" sx={{ color: '#777', display: 'block', mt: 1.5 }}>
                  — (shared with consent)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <Star sx={{ fontSize: 22, color: '#877449', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &ldquo;Professional, compassionate care. I understand my options better than I ever did before.&rdquo;
                </Typography>
                <Typography variant="caption" sx={{ color: '#777', display: 'block', mt: 1.5 }}>
                  — (shared with consent)
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* How the Program Works */}
      <Box sx={{ width: '100%', backgroundColor: '#faf8f5', py: 6, px: 2 }}>
        <Container maxWidth="lg">
          <Typography component="h2" variant="h4" sx={{ color: '#000', fontFamily: 'serif', fontWeight: 600, textAlign: 'center', mb: 4 }}>
            How the Program Works
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <ChatBubbleOutline sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>1-on-1 Consultation</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Discuss your health history, weight loss goals, and develop a personalized plan that fits your needs.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <Medication sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>GLP-1 Medication</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Access to FDA-approved GLP-1 medications like Semaglutide/Ozempic and Tirzepatide/Mounjaro (if appropriate) to support your weight loss.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <HealthAndSafety sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>Ongoing Support</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Receive continuous monitoring, guidance, and encouragement to ensure safe and effective results.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff' }}>
                <VideoCall sx={{ fontSize: 36, color: '#877449', mb: 1 }} />
                <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 1 }}>Virtual Appointments</Typography>
                <Typography variant="body2" sx={{ color: '#333' }}>
                  Convenient secure virtual check-ins with Dr. Fairclough from the comfort of your home.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ width: '100%', backgroundColor: '#f5f3ef', py: 6, px: 2, position: 'relative' }}>
        <Container maxWidth="md">
          <Typography component="h2" variant="h4" sx={{ color: '#000', fontFamily: 'serif', fontWeight: 700, textAlign: 'center', mb: 1 }}>
            Ready To Transform Your Health? Start Your Svelte Journey Today!
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', textAlign: 'center', mb: 4 }}>
            Schedule your initial consultation and begin your medically guided weight loss journey now.
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Security sx={{ fontSize: 32, color: '#877449', mt: 0.25 }} />
                  <Box>
                    <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>Clinically Proven</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      Safe and effective GLP-1 medications, backed by research.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #877449', borderRadius: 1, backgroundColor: '#fff', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Assignment sx={{ fontSize: 32, color: '#877449', mt: 0.25 }} />
                  <Box>
                    <Typography component="h3" variant="h6" sx={{ color: '#000', fontWeight: 600, mb: 0.5 }}>Ongoing Monitoring</Typography>
                    <Typography variant="body2" sx={{ color: '#333' }}>
                      Regular follow-up and adjustments for optimal weight loss results.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center' }}>
            <BookingButton
              variant="contained"
              size="large"
              sx={{
                textTransform: 'none',
                backgroundColor: '#877449',
                color: '#000',
                fontWeight: 600,
                fontSize: '1.1rem',
                px: 4,
                py: 1.5,
                '&:hover': { backgroundColor: '#B8941F' },
              }}
            >
              Get Started
            </BookingButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
