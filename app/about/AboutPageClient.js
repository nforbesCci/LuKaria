'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState } from 'react';
import Script from 'next/script';
import SEO from '../../components/SEO';
import PublicTopMenu from '../../components/PublicTopMenu';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { Login, Instagram, LinkedIn, Facebook } from '@mui/icons-material';

const RICHIE_B_AUDIO_BASE = 'Audio from kadria';
const RICHIE_B_AUDIO_MP3 = `/media/${encodeURIComponent(`${RICHIE_B_AUDIO_BASE}.mp3`)}`;
const RICHIE_B_AUDIO_OGA = `/media/${encodeURIComponent(`${RICHIE_B_AUDIO_BASE}.oga`)}`;

export default function AboutPageClient() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
        title="About Us - Doctor-Guided Care"
        description="Meet Dr. Kadria Fairclough. Medical weight loss Jamaica with doctor-guided care. Svelte by LuKaria offers GLP-1 weight loss, Ozempic, Mounjaro and Tirzepatide through virtual consultations."
        keywords="Dr. Kadria Fairclough, medical weight loss Jamaica, doctor-guided care, GLP-1 weight loss, weight loss doctor Jamaica, virtual clinic Jamaica, obesity management, Ozempic, Mounjaro, Tirzepatide"
        canonical="https://www.lukariagroup.com/about"
      />
      <PublicTopMenu currentPath="/about" />

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            component="img"
            src="/images/Lukaria_logo_small.webp"
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
      <Container maxWidth="lg" sx={{ mt: 18, mb: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography component="h1" variant="h3" gutterBottom sx={{ color: '#877449', fontFamily: 'sans-serif' }}>
            About Svelte by LuKaria
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Tabs - Desktop (Left Side) */}
          <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper elevation={2} sx={{ backgroundColor: '#1a1a1a', position: 'sticky', top: 120, height: 'fit-content' }}>
              <Tabs
                orientation="vertical"
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  minHeight: 'auto',
                  '& .MuiTab-root': {
                    color: '#877449',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    py: 2,
                    px: 2,
                    minHeight: 'auto',
                    '&.Mui-selected': {
                      color: '#B8941F',
                      backgroundColor: '#2C3E50',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#877449',
                    width: 3,
                  },
                }}
              >
                <Tab label="Meet Dr. Kadria Fairclough" />
                <Tab label="MISSION" />
                <Tab label="Our Vision" />
                <Tab label="Our Approach" />
                <Tab label="Why Choose Us?" />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tabs - Mobile (Top) */}
          <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' } }}>
            <Paper elevation={2} sx={{ backgroundColor: '#1a1a1a' }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: '#877449',
                    '&.Mui-selected': {
                      color: '#B8941F',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#877449',
                  },
                }}
              >
                <Tab label="Meet Dr. Kadria" />
                <Tab label="MISSION" />
                <Tab label="Our Vision" />
                <Tab label="Our Approach" />
                <Tab label="Why Choose Us?" />
              </Tabs>
            </Paper>
          </Grid>

          {/* Tab Content */}
          <Grid item xs={12} md={9}>
            <Paper elevation={2} sx={{ p: 4, backgroundColor: '#1a1a1a', minHeight: 400 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Meet Dr. Kadria Fairclough
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-start' } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1.5,
                        width: { xs: '100%', md: 280 },
                        maxWidth: 280,
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src="/images/Kadria turtle neck.webp"
                        alt="Dr. Kadria Fairclough"
                        width={250}
                        height={250}
                        sx={{
                          width: { xs: '100%', md: 250 },
                          maxWidth: 250,
                          height: 'auto',
                          borderRadius: 2,
                          objectFit: 'cover',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#877449', opacity: 0.95, textAlign: 'center', lineHeight: 1.5, px: 0.5 }}>
                        Follow Dr. Fairclough on social media, and listen or watch selected interviews and appearances below.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                        <Box
                          component="a"
                          href="https://www.instagram.com/thekadriafairclough"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Dr. Kadria Fairclough Instagram profile"
                          sx={{ color: '#877449', display: 'inline-flex', '&:hover': { color: '#B8941F' } }}
                        >
                          <Instagram />
                        </Box>
                        <Box
                          component="a"
                          href="https://jm.linkedin.com/in/kadria-fairclough-stone"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Dr. Kadria Fairclough LinkedIn profile"
                          sx={{ color: '#877449', display: 'inline-flex', '&:hover': { color: '#B8941F' } }}
                        >
                          <LinkedIn />
                        </Box>
                      </Box>
                      <Box sx={{ width: '100%', mt: 0.5 }}>
                        <Typography variant="caption" component="p" sx={{ color: '#877449', mb: 1, lineHeight: 1.5, textAlign: 'center' }}>
                          Hear Dr. Fairclough on the Richie B Morning Show (December 20, 2024).
                        </Typography>
                        <Box
                          component="audio"
                          controls
                          preload="none"
                          controlsList="nodownload"
                          sx={{ width: '100%', maxWidth: '100%' }}
                        >
                          <source src={RICHIE_B_AUDIO_OGA} type="audio/ogg" />
                          <source src={RICHIE_B_AUDIO_MP3} type="audio/mpeg" />
                        </Box>
                      </Box>
                      <Box
                        component="a"
                        href="https://www.facebook.com/reel/572700465770089"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          color: '#877449',
                          textDecoration: 'none',
                          typography: 'caption',
                          textAlign: 'left',
                          lineHeight: 1.5,
                          '&:hover': { color: '#B8941F', textDecoration: 'underline' },
                        }}
                        aria-label="Watch Dr. Fairclough speaking for Massy Pharmaceuticals Jamaica on Facebook"
                      >
                        <Facebook sx={{ fontSize: 22, flexShrink: 0 }} />
                        <span>Video: Dr. Fairclough speaking for Massy Pharmaceuticals Jamaica (Facebook).</span>
                      </Box>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                       <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                         Dr. Kadria Fairclough is a Jamaican physician, mother, and advocate for healthier living who understands firsthand the challenges many individuals face with weight management and metabolic health. Born and raised right here in Jamaica, she has witnessed the impact of obesity, diabetes, hypertension, and other metabolic conditions not only among her patients, but within her own family as well.
                       </Typography>
                       <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                         Family has always been at the centre of Dr. Fairclough's life. As a mother to a son, she understands the importance of being healthy enough to fully participate in life's most meaningful moments. She does not take that role for granted and is passionate about helping others improve their health so they can enjoy more quality time with the people they love.
                       </Typography>
                       <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                         This personal connection to metabolic health inspired Dr. Fairclough to establish Svelte by LuKaria, a medical weight management practice dedicated to helping patients achieve sustainable weight loss, improve metabolic health, and transform their body composition through evidence-based care. Her goal extends beyond helping patients lose weight; she is committed to helping them build healthier bodies, reduce their risk of chronic disease, increase longevity, and regain confidence in themselves.
                       </Typography>
                       <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                         Dr. Fairclough believes that every patient deserves compassionate, individualized care free from judgment or stigma. She is deeply committed to patient education and informed decision-making, empowering patients with the knowledge and tools they need to make lasting changes to their health.
                       </Typography>
                       <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                         With years of Canadian telehealth experience and credentials including MBBS and LMCC, Dr. Fairclough provides Jamaica-focused virtual care through medically supervised treatment plans and ongoing support tailored to each patient's unique needs and goals.
                       </Typography>
                       <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8 }}>
                         Through Svelte by LuKaria, Dr. Fairclough is helping Jamaicans take control of their health, improve their metabolic wellness, and create a future where they can live longer, healthier, and more fulfilling lives with their families.
                       </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                      Qualifications
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>

                      {/* 1 — MBBS, UWI (tallest — portrait) */}
                      <Box sx={{ flex: '1 1 180px', maxWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src="/images/WhatsApp Image 2026-06-08 at 11.30.35 AM (3).webp"
                          alt="MBBS, Bachelor of Medicine and Bachelor of Surgery — University of the West Indies"
                          sx={{ width: '100%', height: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                        <Typography variant="caption" sx={{ color: '#877449', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                          MBBS — Bachelor of Medicine &amp; Surgery
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7, textAlign: 'center' }}>
                          University of the West Indies
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.55, textAlign: 'center' }}>
                          Issued: July 2007
                        </Typography>
                      </Box>

                      {/* 2 — Medical Council of Jamaica Annual Practising Certificate */}
                      <Box sx={{ flex: '1 1 180px', maxWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src="/images/WhatsApp Image 2026-06-08 at 11.30.35 AM (2).webp"
                          alt="Medical Council of Jamaica — Annual Practising Certificate 2026"
                          sx={{ width: '100%', height: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                        <Typography variant="caption" sx={{ color: '#877449', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                          Annual Practising Certificate
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7, textAlign: 'center' }}>
                          Medical Council of Jamaica
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.55, textAlign: 'center' }}>
                          Valid: Jan 2026 – Dec 2026
                        </Typography>
                      </Box>

                      {/* 3 — Metabolic Health Essentials Certificate (Vively) */}
                      <Box sx={{ flex: '1 1 180px', maxWidth: 240, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src="/images/Metabolic Health certificate.webp"
                          alt="Metabolic Health Essentials Course — Vively Health, 2024"
                          sx={{ width: '100%', height: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                        <Typography variant="caption" sx={{ color: '#877449', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                          Metabolic Health Essentials
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7, textAlign: 'center' }}>
                          Vively Health (12-hour course)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.55, textAlign: 'center' }}>
                          Issued: 2024
                        </Typography>
                      </Box>

                      {/* 4 — LMCC, Medical Council of Canada (landscape) */}
                      <Box sx={{ flex: '1 1 260px', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src="/images/WhatsApp Image 2026-06-08 at 11.30.35 AM (1).webp"
                          alt="LMCC — Licentiate of the Medical Council of Canada, 2022"
                          sx={{ width: '100%', height: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                        <Typography variant="caption" sx={{ color: '#877449', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                          LMCC — Licentiate of the Medical Council of Canada
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7, textAlign: 'center' }}>
                          Medical Council of Canada
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.55, textAlign: 'center' }}>
                          Issued: February 2022
                        </Typography>
                      </Box>

                      {/* 5 — Derma Institute Botox & Filler (landscape) */}
                      <Box sx={{ flex: '1 1 260px', maxWidth: 340, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box
                          component="img"
                          src="/images/WhatsApp Image 2026-06-08 at 11.30.35 AM.webp"
                          alt="Combined Foundation & Advanced Botox and Dermal Filler Course — Derma Institute, 2025"
                          sx={{ width: '100%', height: 'auto', borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                        />
                        <Typography variant="caption" sx={{ color: '#877449', mt: 1, textAlign: 'center', fontWeight: 600 }}>
                          Foundation &amp; Advanced Botox &amp; Dermal Filler
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.7, textAlign: 'center' }}>
                          Derma Institute — 24 CPD Points
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#877449', opacity: 0.55, textAlign: 'center' }}>
                          Issued: 20 July 2025
                        </Typography>
                      </Box>

                    </Box>
                  </Box>
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    MISSION
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8 }}>
                    Svelte by LuKaria is a modern, virtual medical weight loss clinic dedicated to helping you become the healthiest version of yourself. We specialize in safe, clinically-proven weight loss using GLP-1 medications, delivered through a convenient, accessible online platform—so you can take control of your health on your terms.
                  </Typography>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Our Vision
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8 }}>
                    At Svelte by LuKaria, we believe that everyone deserves the opportunity to live a healthier, more vibrant life. Excess weight is more than just a number—it's a major risk factor for chronic illnesses such as diabetes, heart disease, and joint disorders. Our mission is to reduce those risks by making sustainable, medically supervised weight loss simple, personalized, and accessible—no matter where you are.
                  </Typography>
                </Box>
              )}

              {activeTab === 3 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Our Approach
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                    We combine evidence-based medicine with cutting-edge telehealth technology to deliver weight loss solutions that fit into your life. Using GLP-1 medications—proven to support appetite control and metabolic health—our team creates individualized treatment plans designed to help you shed weight safely and effectively, with ongoing support every step of the way.
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, mb: 2 }}>
                    Our virtual model removes the barriers of traditional healthcare, offering you:
                  </Typography>
                  <Typography variant="body1" component="div" sx={{ color: '#877449', lineHeight: 1.8 }}>
                    <ul>
                      <li>Convenient online consultations</li>
                      <li>Personalized prescription plans</li>
                      <li>Continuous medical support and monitoring</li>
                      <li>Discreet, home-based care</li>
                    </ul>
                  </Typography>
                </Box>
              )}

              {activeTab === 4 && (
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ color: '#877449', fontWeight: '600' }}>
                    Why Choose Us?
                  </Typography>
                  <Divider sx={{ mb: 3, borderColor: '#877449' }} />
                  <Typography variant="body1" component="div" sx={{ color: '#877449', lineHeight: 1.8, mb: 3 }}>
                    <ul>
                      <li>Science-first, patient-centered care</li>
                      <li>GLP-1 medications tailored to your needs</li>
                      <li>Fully virtual, no waiting rooms or long commutes</li>
                      <li>Support from a physician who truly understands the challenges of weight loss</li>
                    </ul>
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#877449', lineHeight: 1.8, fontStyle: 'italic' }}>
                    At Svelte by LuKaria, we're not just helping you lose weight—we're helping you reclaim your health, your confidence, and your future.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

