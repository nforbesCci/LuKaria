'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Footer from './Footer';
import { Box } from '@mui/material';

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
      {mounted && (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      )}
    </>
  );
}

