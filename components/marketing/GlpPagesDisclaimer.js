'use client';

import { Box, Typography } from '@mui/material';

const paragraphs = [
  <>
    This website provides general information only and does not replace personalized medical advice. A doctor–patient
    relationship is only established after a consultation and agreement to proceed with care.
  </>,
  <>
    GLP-1 medications require a prescription, proper medical assessment, and ongoing supervision. Not everyone is a
    suitable candidate, and all treatments carry potential risks and side effects.
  </>,
  <>
    Results vary and are not guaranteed. Medication examples such as Ozempic, Mounjaro, and Wegovy may differ in
    availability and use depending on your location.
  </>,
  <>
    Telehealth has limitations, and some care may require in-person evaluation or testing. This service does not replace
    your primary care provider.
  </>,
  <>
    By using this site, you agree to provide accurate information and participate in your care responsibly. If you believe
    you are experiencing a medical emergency, seek immediate care.
  </>,
];

/** Legal / medical disclaimer for GLP-1 program landing pages */
export default function GlpPagesDisclaimer() {
  return (
    <Box
      component="footer"
      role="note"
      aria-label="Medical and legal disclaimer"
      sx={{
        mt: 6,
        pt: 3,
        borderTop: '1px solid rgba(135, 116, 73, 0.35)',
      }}
    >
      <Typography variant="subtitle2" sx={{ color: '#877449', fontWeight: 700, mb: 1.5 }}>
        Important information
      </Typography>
      {paragraphs.map((body, i) => (
        <Typography
          key={i}
          variant="body2"
          sx={{ color: 'rgba(51, 51, 51, 0.85)', lineHeight: 1.7, mb: i < paragraphs.length - 1 ? 1.5 : 0 }}
        >
          {body}
        </Typography>
      ))}
    </Box>
  );
}
