/** Shared SEO values for server-rendered metadata (mirrors client SEO component). */
export const SITE_URL = 'https://www.lukariagroup.com';

export const routeMetadata = {
  about: {
    title: 'About Us - Doctor-Guided Care | Svelte by LuKaria',
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
    title: 'FAQ - GLP-1 Weight Loss Questions | Svelte by LuKaria',
    description:
      'FAQ about medical weight loss Jamaica, GLP-1 weight loss, Ozempic, Mounjaro, Tirzepatide. Doctor-guided care answers for virtual consultations and weight loss program details.',
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
    title: 'Contact Us | Medical Weight Loss Jamaica | Svelte by LuKaria',
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
    title: 'Pricing | Medical Weight Loss Jamaica | Svelte by LuKaria',
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
    title: 'Medical Weight Loss Jamaica | Doctor-Guided Care | Svelte by LuKaria',
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
    title: 'Blog | Medical Weight Loss Jamaica | Svelte by LuKaria',
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
    title: 'Privacy Policy | Medical Weight Loss Jamaica | Svelte by LuKaria',
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
    title: 'Terms and Conditions | Medical Weight Loss Jamaica | Svelte by LuKaria',
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
