'use client';

import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Script from 'next/script';
import SEO from '../../components/SEO';
import PublicTopMenu from '../../components/PublicTopMenu';
import {
  Container,
  Typography,
  Box,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  ExpandMore,
  Login,
} from '@mui/icons-material';

export default function FaqPageClient() {
  const { user } = useUser();
  const [expandedPanel, setExpandedPanel] = useState('mounjaro-what');
  const [activeTab, setActiveTab] = useState(0); // Default to Mounjaro (index 0)
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Tirzepatide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Tirzepatide is a GLP-1 and GIP receptor agonist prescribed alongside reduced calorie intake and increased physical activity for chronic weight management in adults with BMI outside a healthy range.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Tirzepatide work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Tirzepatide helps regulate blood sugar and reduce how much food you eat, supporting medically supervised weight management.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I take Tirzepatide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Tirzepatide is injected under the skin once weekly at any time of day in the abdomen, thigh, or back of the arm, rotating injection sites each week.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much weight can I lose while taking Tirzepatide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Individual results vary. Clinical studies report that adults may lose up to 22.5% of body weight.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the possible side effects of taking Tirzepatide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Common side effects include nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, and reflux. Serious side effects are possible, so speak with your doctor about risks and suitability.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Semaglutide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Semaglutide is a GLP-1 receptor agonist prescribed with reduced-calorie nutrition and increased physical activity for chronic weight management in adults with BMI outside a healthy range.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does Semaglutide work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Semaglutide slows gastric emptying and stimulates satiety pathways in the brain, which can reduce appetite and hunger.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I take Semaglutide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Semaglutide is injected under the skin once weekly at any time of day in the abdomen, thigh, or back of the arm, rotating injection sites each week.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much weight can I lose while taking Semaglutide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Individual results vary. Clinical studies report up to 20% body weight reduction in adults.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the possible side effects of taking Semaglutide?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Common side effects include nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, and reflux. Serious side effects are possible, so discuss risks with your doctor.',
        },
      },
    ],
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedPanel(isExpanded ? panel : false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setExpandedPanel(newValue === 0 ? 'mounjaro-what' : 'semaglutide-what');
  };

  return (
    <>
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
      <SEO
        title="GLP-1 Weight Loss FAQ Jamaica — Tirzepatide & Semaglutide Questions"
        description="Answers to common questions about GLP-1 weight loss in Jamaica — Tirzepatide, Semaglutide, Ozempic, Mounjaro. Learn how doctor-guided virtual care works at Svelte by LuKaria."
        keywords="GLP-1 weight loss FAQ Jamaica, Tirzepatide questions, Semaglutide FAQ, Ozempic Mounjaro Jamaica, medical weight loss FAQ, doctor-guided care, Dr. Kadria Fairclough"
        canonical="https://www.lukariagroup.com/faq"
      />
      <script
        id="schema-faq-page"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PublicTopMenu currentPath="/faq" />

      {/* Top Navigation Bar */}
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
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Logo and Title on the left */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/images/Lukaria_logo_small.png"
            alt="Lukaria Logo"
            width={48}
            height={48}
            sx={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              display: { xs: 'none', sm: 'block' }
            }}
          />
          <Typography variant="h5" component="span" className="Svelte_logo">
            Svelte
          </Typography>
          <Typography variant="body1" component="span" className="svelte_post_script">
            by LuKaria
          </Typography>
        </Box>
                    
        {/* Login Button on the right */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {!user && (
            <Box
              onClick={() => window.location.href = '/api/auth/login'}
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
                '&:hover': {
                  backgroundColor: '#2C3E50',
                }
              }}
            >
              <Login sx={{ fontSize: 20 }} />
              <Box>
                Sign-up/Login
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ backgroundColor: '#FFFFFF', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg" sx={{ mt: 16, mb: 4 }}>
          <Card sx={{ backgroundColor: '#000000', p: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              textAlign="center" 
              color="primary"
              sx={{
                fontSize: { xs: '1.5rem', sm: '2.5rem' },
                fontWeight: 600,
                mb: 2,
                color: '#877449'
              }}
            >
              Frequently Asked Questions
            </Typography>

            <Typography
              variant="body1"
              component="div"
              sx={{
                color: '#e0e0e0',
                lineHeight: 1.75,
                mb: 4,
                maxWidth: 900,
                mx: 'auto',
                textAlign: 'left',
              }}
            >
              <Typography component="p" variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>
                Welcome to the Svelte by LuKaria FAQ. Here we answer common questions about medically supervised weight loss in Jamaica,
                GLP-1–based therapies (including brands you may have heard of, such as Mounjaro and medicines containing semaglutide), and how our
                virtual, doctor-guided program works. This information is for general education only—it does not replace personalized medical advice.
                Always follow the directions of your prescribing physician.
              </Typography>
              <Typography component="p" variant="body1" sx={{ color: '#e0e0e0', mb: 2 }}>
                Dr. Kadria Fairclough and our team focus on safety, informed consent, and realistic expectations. Whether you are exploring
                options for the first time or comparing programs, the sections below cover how consultations work, what to expect from treatment,
                side effects to discuss with your doctor, and how telehealth fits into ongoing care. Use the tabs to jump between medication
                topics, and expand any question for a concise answer. If you do not see your question listed, contact us—we are happy to help
                during a scheduled visit.
              </Typography>
              <Typography component="p" variant="body1" sx={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
                <strong style={{ color: '#877449' }}>Note:</strong> Medication names and indications change; your clinician will recommend what is appropriate for your health profile and local availability.
              </Typography>
            </Typography>

            {/* Tab Menu */}
            <Box sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                centered
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#877449',
                  },
                  '& .MuiTab-root': {
                    color: '#877449',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      color: '#877449',
                    },
                  },
                }}
              >
                <Tab label="Tirzepatide" />
                <Tab label="Semaglutide" />
              </Tabs>
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Tirzepatide Tab Content */}
            {activeTab === 0 && (
              <Box>
                <Accordion 
                  expanded={expandedPanel === 'mounjaro-what'}
                  onChange={handleAccordionChange('mounjaro-what')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-what-content"
                    id="mounjaro-what-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      What is Tirzepatide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Tirzepatide is a human-based glucagon-like peptide-1 receptor agonist and Glucose Dependent Insulinotropic Polypeptide (GIP) receptor agonist prescribed as an adjunct to a reduced calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-how-works'}
                  onChange={handleAccordionChange('mounjaro-how-works')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-how-works-content"
                    id="mounjaro-how-works-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How does Tirzepatide Work?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Tirzepatide works by regulating your blood sugar and decreasing how much food you eat. Tirzepatide also assists the body to store fat more efficiently.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-how-take'}
                  onChange={handleAccordionChange('mounjaro-how-take')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-how-take-content"
                    id="mounjaro-how-take-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How Do I Take Tirzepatide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Tirzepatide is injected under the skin 1 time each week at any time of the day. It may be injected under the skin of the abdomen, thigh or back of the arm. You should alternate the injection site with each injection.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-weight-loss'}
                  onChange={handleAccordionChange('mounjaro-weight-loss')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-weight-loss-content"
                    id="mounjaro-weight-loss-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How much weight can I lose while taking Tirzepatide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      Individual results may vary. In studies with Tirzepatide adults were able to lose up to 22.5% of their body weight.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'mounjaro-side-effects'}
                  onChange={handleAccordionChange('mounjaro-side-effects')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="mounjaro-side-effects-content"
                    id="mounjaro-side-effects-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      What are the possible side effects of taking Tirzepatide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      The most common side effects include nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 2, color: 'white' }}>
                      You may also experience common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin (welting).
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 2, fontWeight: 600, color: 'white' }}>
                      More serious side effects are possible with use. Talk to your doctor about rare but serious side effects.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#2C3E50', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ color: '#877449', fontWeight: 600, textAlign: 'center' }}>
                    Let your doctor know if you take birth control pills or are having a surgery or other procedure involving anaesthesia.
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Semaglutide Tab Content */}
            {activeTab === 1 && (
              <Box>
                <Accordion 
                  expanded={expandedPanel === 'semaglutide-what'}
                  onChange={handleAccordionChange('semaglutide-what')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="semaglutide-what-content"
                    id="semaglutide-what-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      What is Semaglutide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                    Semaglutide is a human-based glucagon-like peptide-1 receptor agonist (GLP1- RA) prescribed as an adjunct to a reduced-calorie diet and increased physical activity for chronic weight management in adults with an initial body mass index (BMI) that is considered outside a healthy range.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'semaglutide-how-works'}
                  onChange={handleAccordionChange('semaglutide-how-works')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="semaglutide-how-works-content"
                    id="semaglutide-how-works-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How does Semaglutide Work?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                    Semaglutide works by slowing gastric emptying time and stimulating the satiety center in the brain to reduce hunger and appetite.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'semaglutide-how-take'}
                  onChange={handleAccordionChange('semaglutide-how-take')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="semaglutide-how-take-content"
                    id="semaglutide-how-take-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How Do I Take Semaglutide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                    Semaglutide is injected under the skin 1 time each week at any time of the day. It may be injected under the skin of the abdomen, thigh or back of the arm. You should alternate the injection site with each injection
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'semaglutide-weight-loss'}
                  onChange={handleAccordionChange('semaglutide-weight-loss')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="semaglutide-weight-loss-content"
                    id="semaglutide-weight-loss-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      How much weight can I lose while taking Semaglutide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                    Individual results vary. In studies, adults taking Semaglutide lost up to 20% of their body weight.
                    </Typography>
                  </AccordionDetails>
                </Accordion>

                <Accordion
                  expanded={expandedPanel === 'semaglutide-side-effects'}
                  onChange={handleAccordionChange('semaglutide-side-effects')}
                  sx={{ 
                    backgroundColor: '#36454F',
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': { margin: '0' }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore sx={{ color: '#877449' }} />}
                    aria-controls="semaglutide-side-effects-content"
                    id="semaglutide-side-effects-header"
                    sx={{ 
                      backgroundColor: '#36454F',
                      color: 'white',
                      '&:hover': { backgroundColor: '#2C3E50' }
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#877449' }}>
                      What are the possible side effects of taking Semaglutide?
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ backgroundColor: '#36454F', color: 'white' }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'white' }}>
                      The most common side effects include nausea, diarrhea, vomiting, constipation, abdominal pain, headache, fatigue, dyspepsia, dizziness, abdominal distension, belching, hypoglycemia, flatulence, gastroenteritis, and gastroesophageal reflux disease.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 2, color: 'white' }}>
                      You may also experience common injection site reactions characterized by itching, burning at site of administration with or without thickening of the skin(welting).
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.6, mt: 2, fontWeight: 600, color: 'white' }}>
                      More serious side effects are possible with use. Talk to your doctor about possible serious side effects.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ mt: 3, p: 2, backgroundColor: '#2C3E50', borderRadius: 1 }}>
                  <Typography variant="body1" sx={{ color: '#877449', fontWeight: 600, textAlign: 'center' }}>
                    Let your doctor know if you take birth control pills or are having a surgery or other procedure involving anaesthesia. Let your doctor know if you are pregnant or breastfeeding.
                  </Typography>
                </Box>
              </Box>
            )}

            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
}
