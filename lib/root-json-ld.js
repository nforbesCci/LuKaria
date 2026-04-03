import {
  REGISTERED_OFFICE,
  OFFICE_OPENING_HOURS_SCHEMA,
  GOOGLE_BUSINESS_PROFILE_URL,
} from './business';
import { getOrganizationSameAs, getPhysicianSameAs } from './seo-constants';
import { SITE_DEFAULT_DESCRIPTION, SITE_URL } from './public-seo';

/**
 * Global @graph for root layout <head> — WebSite, Organization, MedicalClinic (weight-loss clinic),
 * Physician (YMYL). Crawlers receive this on every page HTML response.
 */
const DEFAULT_PHYSICIAN_SAME_AS = [
  'https://www.instagram.com/thekadriafairclough',
  'https://jm.linkedin.com/in/kadria-fairclough-stone',
];

export function getRootSchemaGraph() {
  const orgSameAs = getOrganizationSameAs();
  const physicianSameAsFromEnv = getPhysicianSameAs();
  const physicianSameAs =
    physicianSameAsFromEnv.length > 0 ? physicianSameAsFromEnv : DEFAULT_PHYSICIAN_SAME_AS;

  return [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Svelte by LuKaria',
      description: SITE_DEFAULT_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: { '@id': `${SITE_URL}/#medicalClinic` },
      inLanguage: 'en-JM',
      potentialAction: [
        {
          '@type': 'ReserveAction',
          name: 'Book a free consultation',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://calendly.com/kadriaf-lukariagroup/30min',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
        },
        {
          '@type': 'ContactAction',
          name: 'Contact Svelte by LuKaria',
          target: `${SITE_URL}/contact`,
        },
      ],
    },
    {
      '@type': 'ImageObject',
      '@id': `${SITE_URL}/#logo`,
      url: `${SITE_URL}/images/Lukaria_logo.png`,
      width: 1200,
      height: 630,
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Svelte by LuKaria',
      url: SITE_URL,
      logo: { '@id': `${SITE_URL}/#logo` },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+1-876-290-3659',
        contactType: 'customer service',
        areaServed: 'JM',
        availableLanguage: 'English',
        email: 'svelte@lukariagroup.com',
      },
      ...(orgSameAs.length ? { sameAs: orgSameAs } : {}),
    },
    {
      '@type': ['MedicalBusiness', 'MedicalClinic', 'MedicalOrganization'],
      '@id': `${SITE_URL}/#medicalClinic`,
      name: 'Svelte by LuKaria',
      alternateName: 'LuKaria Medical Weight Loss',
      description: SITE_DEFAULT_DESCRIPTION,
      url: SITE_URL,
      telephone: '+1-876-290-3659',
      email: 'svelte@lukariagroup.com',
      priceRange: '$$',
      image: { '@id': `${SITE_URL}/#logo` },
      logo: { '@id': `${SITE_URL}/#logo` },
      hasMap: GOOGLE_BUSINESS_PROFILE_URL,
      address: {
        '@type': 'PostalAddress',
        streetAddress: REGISTERED_OFFICE.streetAddress,
        addressLocality: REGISTERED_OFFICE.addressLocality,
        addressRegion: REGISTERED_OFFICE.addressRegion,
        addressCountry: REGISTERED_OFFICE.addressCountry,
      },
      areaServed: { '@type': 'Country', name: 'Jamaica' },
      openingHoursSpecification: OFFICE_OPENING_HOURS_SCHEMA,
      keywords:
        'weight loss clinic Jamaica, medical weight loss, GLP-1, Ozempic, Mounjaro, physician-supervised',
      medicalSpecialty: [
        { '@type': 'MedicalSpecialty', name: 'Bariatric Medicine' },
        { '@type': 'MedicalSpecialty', name: 'Obesity Medicine' },
      ],
      availableService: [
        {
          '@type': 'MedicalTherapy',
          name: 'GLP-1 weight loss (semaglutide / tirzepatide)',
          description:
            'Physician-supervised GLP-1 medication programs for chronic weight management, including semaglutide (Ozempic, Wegovy) and tirzepatide (Mounjaro).',
        },
        {
          '@type': 'MedicalTherapy',
          name: 'Virtual weight loss consultations',
          description:
            'Telehealth consultations with a licensed physician for personalised weight loss treatment plans across Jamaica.',
        },
      ],
      founder: { '@id': `${SITE_URL}/#physician` },
      employee: { '@id': `${SITE_URL}/#physician` },
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
      sameAs: [GOOGLE_BUSINESS_PROFILE_URL, ...orgSameAs],
    },
    {
      '@type': 'Physician',
      '@id': `${SITE_URL}/#physician`,
      name: 'Dr. Kadria Fairclough',
      givenName: 'Kadria',
      familyName: 'Fairclough',
      honorificPrefix: 'Dr.',
      jobTitle: 'Physician & Founder',
      medicalSpecialty: [
        { '@type': 'MedicalSpecialty', name: 'Obesity Medicine' },
        { '@type': 'MedicalSpecialty', name: 'Bariatric Medicine' },
      ],
      credential: ['BSc', 'BMedSci', 'MBBS', 'LMCC'],
      worksFor: { '@id': `${SITE_URL}/#organization` },
      description:
        'Dr. Kadria Fairclough is a licensed physician with over 15 years of experience helping patients achieve their health and wellness goals. She founded Svelte by LuKaria to deliver compassionate, physician-supervised GLP-1 weight loss care virtually across Jamaica.',
      knowsAbout: [
        'Weight management',
        'Obesity medicine',
        'Lifestyle medicine',
        'GLP-1 therapy',
        'Telehealth',
        'Semaglutide',
        'Tirzepatide',
        'Jamaica',
      ],
      url: `${SITE_URL}/about`,
      sameAs: physicianSameAs,
    },
  ];
}
