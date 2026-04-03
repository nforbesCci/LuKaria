import { SITE_URL } from './public-seo';

/** FAQ main entities — shared by server-rendered FAQ JSON-LD and kept in sync with /faq content */
export function getFaqPageMainEntity() {
  return [
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
  ];
}

export function getFaqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faqpage`,
    url: `${SITE_URL}/faq`,
    name: 'GLP-1 weight loss FAQ — Svelte by LuKaria',
    description:
      'Answers to common questions about medically supervised GLP-1 weight loss in Jamaica (Tirzepatide, Semaglutide, Ozempic, Mounjaro) and physician-guided virtual care.',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: getFaqPageMainEntity(),
  };
}
