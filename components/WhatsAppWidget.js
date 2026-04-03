'use client';

import { Fab, Tooltip } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';

/** Matches contact page / marketing links */
const WHATSAPP_HREF = 'https://wa.me/18762903659';

export default function WhatsAppWidget() {
  return (
    <Tooltip title="Message us on WhatsApp" placement="left" arrow>
      <Fab
        component="a"
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp chat with Svelte by LuKaria"
        size="large"
        sx={{
          position: 'fixed',
          right: { xs: 16, sm: 24 },
          bottom: { xs: 'calc(16px + env(safe-area-inset-bottom, 0px))', sm: 'calc(24px + env(safe-area-inset-bottom, 0px))' },
          zIndex: (theme) => theme.zIndex.modal - 1,
          backgroundColor: '#25D366',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(37, 211, 102, 0.45)',
          '&:hover': {
            backgroundColor: '#20bd5a',
            boxShadow: '0 6px 20px rgba(37, 211, 102, 0.55)',
          },
        }}
      >
        <WhatsApp sx={{ fontSize: 32 }} />
      </Fab>
    </Tooltip>
  );
}
