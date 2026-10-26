import { routeMetadata, buildPageMetadata } from '../../lib/public-seo';

export const metadata = buildPageMetadata(routeMetadata.books);

const bookJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Book',
  name: 'The Svelte Table: A Luxuriously Jamaican Cookbook',
  author: {
    '@type': 'Person',
    name: 'Dr. Kadria Fairclough',
  },
  isbn: '9798174857827',
  inLanguage: 'en',
  url: 'https://a.co/d/0as3nikh',
  offers: {
    '@type': 'Offer',
    url: 'https://a.co/d/0as3nikh',
    availability: 'https://schema.org/InStock',
  },
};

export default function BooksLayout({ children }) {
  return (
    <>
      <script
        id="schema-book"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookJsonLd) }}
      />
      {children}
    </>
  );
}
