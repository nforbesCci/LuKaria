'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function ClientLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Load Quagga.js script only on client side */}
      {mounted && (
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"
          strategy="afterInteractive"
        />
      )}
      
      {/* Only render children after mounting to prevent hydration issues */}
      {mounted && children}
    </>
  );
}

