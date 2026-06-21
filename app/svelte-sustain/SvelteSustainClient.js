'use client';

import PublicTopMenu from '../../components/PublicTopMenu';
import PublicTopBar from '../../components/PublicTopBar';
import GlpPagesDisclaimer from '../../components/marketing/GlpPagesDisclaimer';
import { Container, Typography, Box, Button, Paper, Grid, Card, CardContent } from '@mui/material';
import Image from 'next/image';

export default function SvelteSustainClient() {
  return (
    <>
      <PublicTopMenu currentPath="/svelte-sustain" />
      <PublicTopBar />
      <Container maxWidth="lg" sx={{ mt: 14, mb: 8 }}>
        <Grid container spacing={4} alignItems="center" sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative', width: '100%', height: { xs: 300, md: 400 }, borderRadius: 2, overflow: 'hidden' }}>
              <Image 
                src="/images/weightManagemnt.webp" 
                alt="Weight Maintenance" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography component="h1" variant="h3" sx={{ color: '#877449', fontWeight: 700, mb: 2 }}>
              You&apos;ve Reached Your Goal Weight. What&apos;s Your Plan to Stay There?
            </Typography>
            <Typography variant="h6" sx={{ color: '#333', mb: 2, fontWeight: 500 }}>
              Weight loss is a milestone. Long-term success requires a strategy.
            </Typography>
            <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
              Introducing <strong>Svelte Sustain</strong>: personalized maintenance care, ongoing support, and expert guidance to help you maintain your results with confidence.
            </Typography>
            <Typography variant="body1" sx={{ color: '#877449', fontWeight: 700, mb: 4, fontSize: '1.1rem' }}>
              Protect your progress. Sustain your success.
            </Typography>
            <Button
              component="a"
              href="https://calendly.com/kadriaf-lukariagroup/30min"
              variant="contained"
              sx={{
                backgroundColor: '#877449',
                color: '#000',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': { backgroundColor: '#B8941F' },
              }}
            >
              Book a Maintenance Consultation
            </Button>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 4, borderColor: '#877449', mb: 6 }}>
          <Typography variant="h4" sx={{ color: '#877449', mb: 2, fontWeight: 600 }}>
            Svelte Sustain
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            Achieving your goal weight is a significant milestone—but lasting success requires a plan for what comes next. At Svelte by LuKaria, we recognize that long-term weight maintenance is a distinct phase of the journey, one that deserves the same thoughtful attention and medical support as active weight loss.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            Svelte Sustain is designed for patients who have reached their target weight and are ready to focus on preserving their results, protecting their metabolic health, and building sustainable habits for the future. Through ongoing physician oversight, personalized medication management, nutrition guidance, and continued accountability, patients receive the support needed to navigate the challenges of maintenance with confidence.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333' }}>
            Rather than pursuing further weight loss, the focus shifts to stability, body composition, metabolic wellness, and long-term success. With a structured yet flexible approach, Svelte Sustain™ helps patients safeguard the progress they have worked so hard to achieve and maintain a healthier, more vibrant life for years to come.
          </Typography>
        </Paper>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%', backgroundColor: '#faf6ef', borderRadius: 2 }}>
              <Typography variant="h5" sx={{ color: '#877449', mb: 2, fontWeight: 600 }}>
                Who Is Svelte Sustain For?
              </Typography>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                Svelte Sustain is designed for individuals who have successfully completed an active weight-loss phase and are ready to focus on maintaining their results. Rather than serving as a starting point for weight-loss treatment, the program supports patients as they transition into long-term weight and metabolic health management.
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600, mb: 1 }}>
                This program may be appropriate for individuals who:
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, mb: 2, color: '#333', '& li': { mb: 1 } }}>
                <Typography component="li" variant="body2">Have achieved their goal weight or are within an agreed-upon maintenance range.</Typography>
                <Typography component="li" variant="body2">Have completed an active weight-loss program, whether through Svelte by LuKaria or another medically supervised program.</Typography>
                <Typography component="li" variant="body2">Are clinically stable and tolerating their treatment plan well.</Typography>
                <Typography component="li" variant="body2">Are ready to shift their focus from weight loss to weight maintenance, body composition, and sustainable lifestyle habits.</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#877449', fontWeight: 600, fontStyle: 'italic' }}>
                A maintenance consultation is required to determine eligibility and ensure that Svelte Sustain is the most appropriate next step.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%', backgroundColor: '#faf6ef', borderRadius: 2 }}>
              <Typography variant="h5" sx={{ color: '#877449', mb: 2, fontWeight: 600 }}>
                When Additional Active-Phase Support May Be Needed
              </Typography>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                Some patients may benefit from continuing or returning to a more active treatment pathway before entering maintenance.
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600, mb: 1 }}>
                This may include individuals who:
              </Typography>
              <Box component="ul" sx={{ pl: 2.5, mb: 2, color: '#333', '& li': { mb: 1 } }}>
                <Typography component="li" variant="body2">Are still working toward a stable goal weight.</Typography>
                <Typography component="li" variant="body2">Are actively adjusting or escalating medication doses.</Typography>
                <Typography component="li" variant="body2">Have experienced recent treatment-related side effects that require further evaluation.</Typography>
                <Typography component="li" variant="body2">Have developed new medical conditions or factors that may affect the suitability of ongoing GLP-1 therapy.</Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#333' }}>
                During your consultation, Dr. Fairclough will review your progress, current health status, and long-term goals to recommend the pathway that best supports your continued success.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ color: '#877449', mb: 3, fontWeight: 600, textAlign: 'center' }}>
            What&apos;s Included in Svelte Sustain
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 4, textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            Every Svelte Sustain membership is designed to help you maintain your results with confidence and ongoing professional support.
          </Typography>
          
          <Grid container spacing={3}>
            {[
              { title: '✔ Physician-Led Maintenance Care', desc: 'Regular reviews to monitor your progress, health, and long-term success.' },
              { title: '✔ Personalized GLP-1 Management', desc: 'Ongoing medication management, including maintenance dosing and treatment adjustments when appropriate.' },
              { title: '✔ Nutrition Guidance', desc: 'Practical nutrition support focused on maintaining results while enjoying a balanced lifestyle.' },
              { title: '✔ Supportive Community Sessions', desc: 'Access to virtual group sessions that provide accountability, encouragement, and shared experiences.' },
              { title: '✔ Ongoing Monitoring', desc: 'Regular tracking of weight, body composition, and key health markers to support continued metabolic wellness.' },
              { title: '✔ Dedicated Care Coordination', desc: 'Assistance with scheduling, getting refills, follow-up care, and program support.' },
              { title: '✔ Weight Regain Prevention Strategy', desc: 'Early identification of setbacks and access to enhanced support if additional intervention is needed.' },
              { title: '✔ Flexible Virtual Care', desc: 'Convenient access to your care team from the comfort of your home.' }
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', borderColor: '#877449' }}>
                  <Typography variant="subtitle2" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Paper sx={{ p: 4, backgroundColor: '#877449', color: '#fff', borderRadius: 2, mb: 6 }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Medication Management During Maintenance
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The goal of maintenance is different from the goal of active weight loss. Rather than continuing to pursue weight reduction, treatment focuses on preserving the progress you have achieved while supporting long-term metabolic health.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Research has shown that many individuals experience weight regain after stopping GLP-1 therapy. For this reason, medication decisions during maintenance are individualized and made in partnership with Dr. Fairclough based on your health goals, treatment response, and preferences.
          </Typography>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Your maintenance plan may include:
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, mb: 3, '& li': { mb: 1 } }}>
            <Typography component="li" variant="body1">Continuing your current GLP-1 dose if your weight and metabolic health remain stable.</Typography>
            <Typography component="li" variant="body1">Transitioning to a lower maintenance dose while closely monitoring your progress.</Typography>
            <Typography component="li" variant="body1">Switching from injections to an oral GLP-1 medication when appropriate.</Typography>
            <Typography component="li" variant="body1">Gradually tapering off medication with enhanced nutrition, lifestyle, and accountability support for suitable candidates.</Typography>
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            The right approach is different for every patient. Throughout the Svelte Sustain program, your treatment plan will be regularly reviewed and adjusted to help you maintain your results with confidence.
          </Typography>
        </Paper>

        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" sx={{ color: '#877449', mb: 4, fontWeight: 600, textAlign: 'center' }}>
            Choose the Maintenance Plan That&apos;s Right for You
          </Typography>
          
          <Grid container spacing={3}>
            {/* Flex Plan */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#877449' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
                    🌿 Svelte Sustain Flex
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600, mb: 2 }}>
                    Month-to-Month Membership
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', mb: 3 }}>
                    Ideal for patients who are newly transitioning from active weight loss and would benefit from closer monitoring during the early maintenance phase.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>Includes:</Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 3, color: '#333', '& li': { mb: 0.5 } }}>
                    <Typography component="li" variant="body2">Monthly physician review</Typography>
                    <Typography component="li" variant="body2">Monthly nutrition support</Typography>
                    <Typography component="li" variant="body2">Monthly group coaching session</Typography>
                    <Typography component="li" variant="body2">Medication management and refill coordination</Typography>
                    <Typography component="li" variant="body2">Svelte Team support</Typography>
                    <Typography component="li" variant="body2">No long-term commitment</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, fontStyle: 'italic' }}>
                    Best for: Patients who want maximum flexibility and frequent check-ins while establishing long-term stability.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Quarterly Plan */}
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#faf6ef', border: '2px solid #877449' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
                    ✨ Svelte Sustain Quarterly
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600, mb: 2 }}>
                    3-Month Commitment
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', mb: 3 }}>
                    Designed for patients who have demonstrated early weight stability and are ready for a more structured maintenance experience.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>Includes:</Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 3, color: '#333', '& li': { mb: 0.5 } }}>
                    <Typography component="li" variant="body2">Regular physician reviews</Typography>
                    <Typography component="li" variant="body2">Monthly nutrition support</Typography>
                    <Typography component="li" variant="body2">Monthly group coaching sessions</Typography>
                    <Typography component="li" variant="body2">Ongoing medication management</Typography>
                    <Typography component="li" variant="body2">Svelte Team support</Typography>
                    <Typography component="li" variant="body2">Quarterly laboratory monitoring</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, fontStyle: 'italic' }}>
                    Best for: Patients seeking a balance of accountability, convenience, and value.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Complete Plan */}
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderColor: '#877449' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
                    💎 Svelte Sustain Complete
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: '#333', fontWeight: 600, mb: 2 }}>
                    6-Month Commitment
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#333', mb: 3 }}>
                    Our most comprehensive and cost-effective maintenance option for patients with established weight stability who are focused on long-term success.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#877449', fontWeight: 600, mb: 1 }}>Includes:</Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 3, color: '#333', '& li': { mb: 0.5 } }}>
                    <Typography component="li" variant="body2">Scheduled physician reviews throughout the program</Typography>
                    <Typography component="li" variant="body2">Monthly nutrition support</Typography>
                    <Typography component="li" variant="body2">Monthly group coaching sessions</Typography>
                    <Typography component="li" variant="body2">Ongoing medication management</Typography>
                    <Typography component="li" variant="body2">Svelte Team support</Typography>
                    <Typography component="li" variant="body2">Interval laboratory monitoring</Typography>
                    <Typography component="li" variant="body2">End-of-program review and future planning</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#333', fontWeight: 600, fontStyle: 'italic' }}>
                    Best for: Patients who want a streamlined, long-term maintenance plan with continued professional guidance and support.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        <Paper variant="outlined" sx={{ p: 4, borderColor: '#877449', mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: '#877449', mb: 2, fontWeight: 600 }}>
            Not Sure Which Option Is Right for You?
          </Typography>
          <Typography variant="body1" sx={{ color: '#333' }}>
            During your maintenance consultation, Dr. Fairclough will review your progress, goals, and treatment history and recommend the Sustain™ pathway best suited to your needs.
          </Typography>
        </Paper>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: '#877449', mb: 2, fontWeight: 700 }}>
            Sustain Your Success. Elevate Your Health.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, maxWidth: 800, mx: 'auto' }}>
            You&apos;ve put in the work to transform your health and reach your goals. Now it&apos;s time to protect those results for the long term. Svelte Sustain provides the structure, expertise, and ongoing support needed to help you preserve your results and continue thriving.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 4, maxWidth: 800, mx: 'auto' }}>
            Book your maintenance consultation today and discover a personalized approach to long-term metabolic wellness.<br/><br/>
            <strong>Because lasting results deserve lasting support.</strong>
          </Typography>
          <Button
            component="a"
            href="https://calendly.com/kadriaf-lukariagroup/30min"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#877449',
              color: '#000',
              fontWeight: 700,
              px: 5,
              py: 2,
              fontSize: '1.2rem',
              '&:hover': { backgroundColor: '#B8941F' },
            }}
          >
            Book a Maintenance Consultation
          </Button>
        </Box>

        <GlpPagesDisclaimer />
      </Container>
    </>
  );
}
