import { Suspense } from 'react';
import FaqPageClient from './FaqPageClient';

export const dynamic = 'force-dynamic';

export default function FaqPage() {
  return (
    <Suspense fallback={null}>
      <FaqPageClient />
    </Suspense>
  );
}
