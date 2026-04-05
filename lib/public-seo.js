/** Shared SEO values for server-rendered metadata (mirrors client SEO component). */
export const SITE_URL = 'https://www.lukariagroup.com';

/** Site-wide default title — primary keyword first (homepage + fallbacks). */
export const SITE_DEFAULT_TITLE = 'Weight Loss Jamaica — GLP-1 & Ozempic | Svelte by LuKaria';

/** Meta description: Jamaica, physician-supervised, CTA; ~155 chars for SERPs. */
export const SITE_DEFAULT_DESCRIPTION =
  'Physician-supervised weight loss in Jamaica with GLP-1 medications (Ozempic, Mounjaro, Tirzepatide). Book a free consultation — flat monthly fee, island-wide virtual care.';

/** Titles omit trailing " | Svelte by LuKaria" — root layout template adds it once. */
export const routeMetadata = {
  about: {
    title: 'About Us - Doctor-Guided Care',
    description:
      'Meet Dr. Kadria Fairclough. Medical weight loss Jamaica with doctor-guided care. Svelte by LuKaria offers GLP-1 weight loss, Ozempic, Mounjaro and Tirzepatide through virtual consultations.',
    keywords: [
      'Dr. Kadria Fairclough',
      'medical weight loss Jamaica',
      'doctor-guided care',
      'GLP-1 weight loss',
      'weight loss doctor Jamaica',
      'virtual clinic Jamaica',
      'obesity management',
      'Ozempic',
      'Mounjaro',
      'Tirzepatide',
    ],
    path: '/about',
  },
  faq: {
    title: 'GLP-1 Weight Loss FAQ Jamaica — Tirzepatide & Semaglutide Questions',
    description:
      'Answers to common questions about GLP-1 weight loss in Jamaica — Tirzepatide, Semaglutide, Ozempic, Mounjaro. Learn how doctor-guided virtual care works at Svelte by LuKaria.',
    keywords: [
      'GLP-1 weight loss FAQ',
      'Ozempic Mounjaro questions',
      'medical weight loss Jamaica FAQ',
      'Tirzepatide answers',
      'doctor-guided care FAQ',
      'weight loss clinic Jamaica',
      'Dr. Kadria Fairclough',
    ],
    path: '/faq',
  },
  contact: {
    title: 'Contact Us | Medical Weight Loss Jamaica',
    description:
      'Contact Svelte by LuKaria for medical weight loss Jamaica. Registered office Kingston. Get in touch about doctor-guided GLP-1 weight loss, Ozempic, Mounjaro, Tirzepatide consultations and program enrollment.',
    keywords: [
      'contact weight loss clinic Jamaica',
      'medical weight loss contact',
      'GLP-1 weight loss consultation',
      'doctor-guided care contact',
      'telehealth Jamaica',
      'patient care support',
      'Dr. Kadria Fairclough',
    ],
    path: '/contact',
  },
  info: {
    title: 'Pricing | Medical Weight Loss Jamaica',
    description:
      'Transparent pricing for medical weight loss Jamaica. Svelte by LuKaria GLP-1 weight loss program includes physician appointments, GLP-1 medications. Doctor-guided care with flat monthly fee.',
    keywords: [
      'medical weight loss pricing Jamaica',
      'GLP-1 weight loss cost',
      'Ozempic Mounjaro price Jamaica',
      'weight loss program cost',
      'doctor-guided care pricing',
      'affordable weight loss Jamaica',
      'Dr. Kadria Fairclough',
    ],
    path: '/info',
  },
  ads: {
    title: 'Medical Weight Loss Jamaica | Doctor-Guided Care',
    description:
      'Medical weight loss Jamaica with doctor-guided care. Physician-supervised weight loss programs. Flat monthly fee. Schedule your free consultation today.',
    keywords: [
      'medical weight loss Jamaica',
      'doctor-guided care',
      'physician-supervised weight loss',
      'weight loss centre Jamaica',
      'obesity treatment',
      'weight management',
      'Dr. Kadria Fairclough',
    ],
    path: '/ads',
  },
  blog: {
    title: 'Blog | Medical Weight Loss Jamaica',
    description:
      'Health and weight loss insights from Svelte by LuKaria. Doctor-guided care tips for GLP-1 weight loss, Ozempic, Mounjaro and healthy living.',
    keywords: [
      'weight loss blog Jamaica',
      'GLP-1 weight loss tips',
      'medical weight loss insights',
      'health blog',
      'Dr. Kadria Fairclough',
    ],
    path: '/blog',
  },
  privacyPolicy: {
    title: 'Privacy Policy | Medical Weight Loss Jamaica',
    description:
      'Privacy policy for Svelte by LuKaria medical weight loss Jamaica. How we protect your health information and maintain HIPAA compliance for doctor-guided GLP-1 weight loss care.',
    keywords: [
      'privacy policy',
      'HIPAA compliance',
      'medical weight loss privacy',
      'patient privacy Jamaica',
      'telehealth privacy',
      'medical data protection',
      'doctor-guided care',
      'Dr. Kadria Fairclough',
    ],
    path: '/privacy-policy',
  },
  terms: {
    title: 'Terms and Conditions | Medical Weight Loss Jamaica',
    description:
      'Terms and conditions for Svelte by LuKaria medical weight loss Jamaica. Your rights and responsibilities for doctor-guided GLP-1 weight loss and telehealth services.',
    keywords: [
      'terms and conditions',
      'medical weight loss agreement',
      'patient terms Jamaica',
      'telehealth terms',
      'doctor-guided care terms',
      'medical services agreement',
      'Dr. Kadria Fairclough',
    ],
    path: '/terms',
  },
  glp1WeightLoss: {
    title: 'GLP-1 Weight Loss Jamaica | Ozempic & Mounjaro | Weight Loss Doctor',
    description:
      'GLP-1 weight loss in Jamaica with a dedicated weight loss doctor. Ozempic (semaglutide), Mounjaro (tirzepatide), and medically supervised plans with Dr. Kadria Fairclough at Svelte by LuKaria—virtual physician-guided care.',
    keywords: [
      'GLP-1 weight loss Jamaica',
      'Ozempic Jamaica',
      'Mounjaro Jamaica',
      'weight loss doctor Jamaica',
      'semaglutide Jamaica',
      'tirzepatide Jamaica',
      'medical weight loss Jamaica',
      'doctor-guided GLP-1',
      'weight management Jamaica',
      'Dr. Kadria Fairclough',
    ],
    path: '/glp-1-weight-loss',
  },
  ozempicSemaglutide: {
    title: 'Ozempic Jamaica — Semaglutide & Weight Loss Doctor',
    description:
      'Ozempic Jamaica: semaglutide weight management with a weight loss doctor. Physician-supervised virtual care with Dr. Kadria Fairclough at Svelte by LuKaria. Explore Mounjaro (tirzepatide) and full GLP-1 options on our site.',
    keywords: [
      'Ozempic Jamaica',
      'semaglutide Jamaica',
      'weight loss doctor Jamaica',
      'Mounjaro Jamaica',
      'Ozempic weight loss',
      'GLP-1 Jamaica',
      'medical weight loss Jamaica',
      'doctor-guided semaglutide',
      'Dr. Kadria Fairclough',
    ],
    path: '/ozempic-semaglutide',
  },
  mounjaroTirzepatide: {
    title: 'Mounjaro Jamaica — Tirzepatide & Weight Loss Doctor',
    description:
      'Mounjaro Jamaica: tirzepatide weight management with a weight loss doctor. Physician-supervised virtual care with Dr. Kadria Fairclough at Svelte by LuKaria. See also Ozempic (semaglutide) and GLP-1 program overview.',
    keywords: [
      'Mounjaro Jamaica',
      'tirzepatide Jamaica',
      'weight loss doctor Jamaica',
      'Ozempic Jamaica',
      'Mounjaro weight loss',
      'GLP-1 GIP Jamaica',
      'medical weight loss Jamaica',
      'doctor-guided tirzepatide',
      'Dr. Kadria Fairclough',
    ],
    path: '/mounjaro-tirzepatide',
  },
  testimonials: {
    title: 'Patient Testimonials | Medical Weight Loss Jamaica',
    description:
      'Read anonymized patient testimonials from Svelte by LuKaria, sharing experiences with doctor-guided medical weight loss in Jamaica.',
    keywords: [
      'weight loss testimonials Jamaica',
      'medical weight loss reviews',
      'doctor-guided care testimonials',
      'GLP-1 patient stories',
      'Svelte by LuKaria testimonials',
      'Dr. Kadria Fairclough',
    ],
    path: '/testimonials',
  },
};

export function buildPageMetadata(config) {
  const url = `${SITE_URL}${config.path}`;
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: config.title,
      description: config.description,
      url,
      siteName: 'Svelte by LuKaria',
      locale: 'en_JM',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
    },
  };
}
