import { getFaqPageJsonLd } from '../../lib/faq-json-ld';

/** Server-rendered FAQ JSON-LD so validators and crawlers see it without waiting for client JS */
export default function FaqJsonLd() {
  return (
    <script
      id="schema-faq-page"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getFaqPageJsonLd()) }}
    />
  );
}
