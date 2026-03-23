'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Login } from '@mui/icons-material';

export default function PublicTopBar() {
  const { user, isLoading } = useUser();

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 48,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        zIndex: 1000,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          src="/images/Lukaria_logo_small.png"
          alt="Lukaria Logo"
          sx={{
            width: 48,
            height: 48,
            objectFit: 'contain',
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Typography variant="h5" component="span" className="Svelte_logo">
          Svelte
        </Typography>
        <Typography variant="body1" component="span" className="svelte_post_script">
          by LuKaria
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isLoading ? (
          <CircularProgress size={24} sx={{ color: '#877449' }} />
        ) : !user ? (
          <Button
            onClick={() => (window.location.href = '/api/auth/login')}
            variant="contained"
            startIcon={<Login />}
            sx={{
              textTransform: 'none',
              backgroundColor: '#36454F',
              color: '#877449',
              minWidth: { xs: 'auto', sm: '64px' },
              px: { xs: 1, sm: 2 },
              '&:hover': { backgroundColor: '#2C3E50' },
            }}
          >
            Sign-up/Login
          </Button>
        ) : (
          <Button
            onClick={() => (window.location.href = `${process.env.AUTH0_BASE_URL}/api/auth/logout`)}
            variant="outlined"
            sx={{
              textTransform: 'none',
              borderColor: '#877449',
              color: '#877449',
              minWidth: { xs: 'auto', sm: '64px' },
              px: { xs: 1, sm: 2 },
              '&:hover': {
                borderColor: '#877449',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
              },
            }}
          >
            Logout
          </Button>
        )}
      </Box>
    </Box>
  );
}

