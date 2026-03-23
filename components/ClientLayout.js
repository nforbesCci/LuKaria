'use client';

import Footer from './Footer';
import { Box } from '@mui/material';

/**
 * Renders immediately (no mounted gate) so LCP/FCP are not blocked.
 * Quagga barcode script loads only on /barcode-scanner and via BarcodeScanner component.
 */
export default function ClientLayout({ children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ flex: 1 }}>{children}</Box>
      <Footer />
    </Box>
  );
}
