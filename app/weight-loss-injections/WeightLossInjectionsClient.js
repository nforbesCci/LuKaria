'use client';

import PublicTopMenu from '../../components/PublicTopMenu';
import PublicTopBar from '../../components/PublicTopBar';
import GlpPagesDisclaimer from '../../components/marketing/GlpPagesDisclaimer';
import GlpVirtualProgramSection from '../../components/marketing/GlpVirtualProgramSection';
import { Container, Typography, Box, Button, Paper, Grid } from '@mui/material';
export default function WeightLossInjectionsClient() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: 'Physician-supervised weight loss injections',
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
    url: 'https://www.lukariagroup.com/weight-loss-injections',
    description:
      'Physician-supervised weight loss injections in Jamaica—virtual follow-up and individualized planning with Dr. Kadria Fairclough.',
  };

  return (
    <>
      <PublicTopMenu currentPath="/weight-loss-injections" />
      <PublicTopBar />
      <Container maxWidth="lg" sx={{ mt: 14, mb: 8 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
        <Box sx={{ mb: 4 }}>
          <Typography component="h1" variant="h3" sx={{ color: '#877449', fontWeight: 700, mb: 1 }}>
            Weight Loss Injections in Jamaica — Physician-Supervised
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', maxWidth: 900, mb: 3 }}>
            When people talk about &quot;weight loss injections,&quot; they are usually referring to a class of injectable medications known clinically as GLP-1 receptor agonists. These include well-known options like Ozempic and Mounjaro. Svelte by LuKaria offers physician-supervised access to these injectable treatments as part of a comprehensive weight management plan.
          </Typography>
          <Button
            component="a"
            href="https://calendly.com/kadriaf-lukariagroup/weight-loss-consultation"
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
            Book a Free Consultation
          </Button>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%', borderColor: '#877449' }}>
              <Typography variant="h5" sx={{ color: '#877449', mb: 2 }}>
                What injections do you use?
              </Typography>
              <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
                We prescribe medications with the active ingredients <strong>Semaglutide</strong> (found in Ozempic/Wegovy) and <strong>Tirzepatide</strong> (found in Mounjaro/Zepbound). These work by mimicking natural hormones to help regulate your appetite and blood sugar.
              </Typography>
              <Button component="a" href="/glp-1-weight-loss" variant="outlined" sx={{ borderColor: '#877449', color: '#877449' }}>
                Learn more about GLP-1s
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: '100%', borderColor: '#877449' }}>
              <Typography variant="h5" sx={{ color: '#877449', mb: 2 }}>
                How are they administered?
              </Typography>
              <Typography variant="body1" sx={{ color: '#333' }}>
                GLP-1 medications are available in both weekly injectable and daily oral formulations. During your one-on-one consultation, Dr. Fairclough will discuss the available options, including the benefits and considerations of each route of administration, to determine which best aligns with your health goals, lifestyle, and medical needs. If treatment is appropriate, you will receive detailed guidance on proper use of your prescribed medication, along with ongoing support and monitoring throughout your metabolic health journey.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 3, borderColor: '#877449', mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#877449', mb: 2 }}>
            Are injections safe?
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            GLP-1 medications have been extensively studied and are generally considered safe and well tolerated when prescribed and monitored appropriately. However, like all medications, they may not be suitable for everyone and can be associated with potential side effects and risks.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            At Svelte by LuKaria, patient safety is our highest priority. Dr. Fairclough conducts a thorough medical assessment to determine whether GLP-1 therapy is appropriate for each individual and believes strongly in patient education and informed decision-making. Before treatment begins, you will have the opportunity to discuss the potential benefits, risks, and expected outcomes of therapy so that you can make a confident and informed choice about your care.
          </Typography>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderColor: '#877449', mb: 4 }}>
          <Typography variant="h5" sx={{ color: '#877449', mb: 2 }}>
            Who is a good candidate?
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            GLP-1 medications may be appropriate for adults living with obesity or for individuals who are overweight and have weight-related metabolic conditions such as type 2 diabetes, high blood pressure, or elevated cholesterol. Certain GLP-1 therapies may also be approved for adolescents with obesity and related health concerns.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            Determining whether GLP-1 therapy is right for you requires a comprehensive medical evaluation. During your consultation, Dr. Fairclough will review your medical history, current health status, and treatment goals to develop an individualized plan tailored to your needs.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            At Svelte by LuKaria, we believe that sustainable results require more than medication alone. Successful patients are committed to actively participating in their care through regular follow-up appointments, ongoing monitoring, and meaningful lifestyle modifications that support long-term metabolic health and body composition goals.
          </Typography>
        </Paper>

        <Paper sx={{ p: 4, backgroundColor: '#faf6ef', borderRadius: 2, mb: 4, border: '1px solid #877449' }}>
          <Typography variant="h5" sx={{ color: '#877449', mb: 2, fontWeight: 600 }}>
            Ready to get started?
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            At Svelte by LuKaria, we believe that achieving lasting improvements in metabolic health requires a personalized, evidence-based approach centered on education, partnership, and ongoing support. Your journey begins with a comprehensive consultation with Dr. Fairclough, who will carefully evaluate your medical history, metabolic health, lifestyle, and individual goals.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            If treatment is appropriate, a customized care plan will be developed to address your unique needs. This may include GLP-1 therapy, nutrition and lifestyle interventions, and regular medical follow-up to support sustainable progress and long-term success.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2 }}>
            Dr. Fairclough is committed to ensuring that every patient feels informed, supported, and empowered throughout their care. Patients prescribed injectable medications receive thorough education and guidance to ensure safe and confident administration. Alternative treatment options and in-person services are also available for individuals who prefer a different approach.
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3 }}>
            Whether care is delivered virtually or in person, our mission is to make high-quality metabolic health treatment accessible while providing the accountability, expertise, and support needed to help you achieve meaningful and sustainable results.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component="a"
              href="https://calendly.com/kadriaf-lukariagroup/weight-loss-consultation"
              variant="contained"
              sx={{ backgroundColor: '#877449', color: '#000', '&:hover': { backgroundColor: '#B8941F' } }}
            >
              Book a Free Consultation
            </Button>
          </Box>
        </Paper>

        <GlpPagesDisclaimer />
      </Container>
    </>
  );
}
