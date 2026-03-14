'use client';

import Link from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAppDispatch } from '../store/hooks';
import { fetchProfile } from '../store/slices/profileSlice';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import { LogoutOutlined, Person } from '@mui/icons-material';

const BANNER_HEIGHT = 48;
const APP_BAR_HEIGHT = 64;
const HEADER_TOTAL_HEIGHT = BANNER_HEIGHT + APP_BAR_HEIGHT;

export default function Header() {
  const { user, isLoading } = useUser();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load profile when user is authenticated
  useEffect(() => {
    if (user && mounted) {
      console.log('🔄 Header: User authenticated, loading profile...');
      dispatch(fetchProfile());
    }
  }, [user, mounted, dispatch]);

  // Check if navigation drawer should be visible
  const isNavigationVisible = () => {
    if (!mounted || isLoading) return false;
    if (pathname === '/' && !user) return false;
    if (pathname === '/schedule') {
      // Check Redux store instead of localStorage
      return false; // Navigation hidden on schedule page until completion
    }
    return true;
  };

  const linkSx = {
    color: '#000000',
    fontWeight: '600',
    cursor: 'pointer',
    '&:hover': { textDecoration: 'underline' },
  };

  return (
    <>
      {/* Top origin banner - same as public pages */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: BANNER_HEIGHT,
          backgroundColor: '#877449',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          zIndex: 1001,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography component={Link} href="/" variant="body2" sx={linkSx}>
            Home
          </Typography>
          <Typography component={Link} href="/info" variant="body2" sx={linkSx}>
            Info
          </Typography>
          <Typography component={Link} href="/faq" variant="body2" sx={linkSx}>
            FAQ
          </Typography>
          <Typography component={Link} href="/contact" variant="body2" sx={linkSx}>
            Contact
          </Typography>
          <Typography component={Link} href="/about" variant="body2" sx={linkSx}>
            About Us
          </Typography>
          <Typography component={Link} href="/blog" variant="body2" sx={linkSx}>
            Blog
          </Typography>
        </Box>
      </Box>

      {/* Main app bar - fixed below banner */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          top: BANNER_HEIGHT,
          backgroundColor: '#000000',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 1000,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: 3, minHeight: { xs: 56, sm: APP_BAR_HEIGHT } }}>
        {/* Logo and Title on the left - always rendered */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          marginLeft: isNavigationVisible() ? '30px' : '0px'
        }}>
          <Box
            component="img"
            src="/images/LuKaria_logo_small.png"
            alt="LuKaria Logo"
            sx={{
              width: 48,
              height: 48,
              objectFit: 'contain',
              display: { xs: 'none', sm: 'block' }
            }}
          />
          <Typography variant="h5" component="span" className="Svelte_logo">
            Svelte
          </Typography>
          <Typography variant="body1" component="span" className="svelte_post_script">
            by LuKaria
          </Typography>
        </Box>
        
        {/* User info on the right - always render container, content varies */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 32 }}>
          {!mounted || isLoading ? (
            <CircularProgress size={24} sx={{ color: '#877449' }} />
          ) : user ? (
            <>
              <Avatar
                src={user.picture}
                alt={user.name}
                sx={{ width: 32, height: 32 }}
              >
                <Person />
              </Avatar>
              <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#877449' }}>
                {user.name}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<LogoutOutlined />}
                href={`${process.env.AUTH0_BASE_URL}/api/auth/logout`}
                sx={{ 
                  textTransform: 'none',
                  borderColor: '#877449',
                  color: '#877449',
                  minWidth: { xs: 'auto', sm: '64px' },
                  px: { xs: 1, sm: 2 },
                  '&:hover': {
                    borderColor: '#877449',
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  }
                }}
              >
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Log Out
                </Box>
              </Button>
            </>
          ) : (
            <CircularProgress size={24} sx={{ color: '#877449' }} />
          )}
        </Box>
      </Toolbar>
      </AppBar>

      {/* Spacer so page content starts below the fixed header */}
      <Box sx={{ height: HEADER_TOTAL_HEIGHT }} />
    </>
  );
}
