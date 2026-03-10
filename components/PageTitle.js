'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Dashboard } from '@mui/icons-material';

const backButtonSx = {
  textTransform: 'none',
  borderColor: '#877449',
  color: '#877449',
  minWidth: { xs: 'auto', sm: 'auto' },
  px: { xs: 1, sm: 2 },
  '&:hover': {
    borderColor: '#877449',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
};

export default function PageTitle({
  title,
  subtitle,
  actions,
  showBackButton = true,
  children,
  ...paperProps
}) {
  const pathname = usePathname();
  const showBack = showBackButton && pathname !== '/dashboard';

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4, ...paperProps.sx }} {...paperProps}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {showBack && (
          <Box>
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              startIcon={<Dashboard />}
              sx={backButtonSx}
            >
              <Box sx={{ display: { xs: 'none', sm: 'inline' } }}>Return to Dashboard</Box>
              <Box sx={{ display: { xs: 'inline', sm: 'none' } }}>Dashboard</Box>
            </Button>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {children != null ? (
              children
            ) : (
              <Box>
                <Typography
                  variant="h4"
                  gutterBottom={!!subtitle}
                  color="primary"
                  sx={{
                    fontSize: { xs: '1.25rem', sm: '2.125rem' },
                    fontWeight: 600,
                  }}
                >
                  {title}
                </Typography>
                {subtitle && (
                  <Typography variant="body1" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
        </Box>
      </Box>
    </Paper>
  );
}
