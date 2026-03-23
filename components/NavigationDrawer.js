'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '../store/hooks';
import { canAccessPage } from '../hooks/useAccessControl';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  Close as CloseIcon,
  MedicalServices,
  Scale,
  Restaurant,
  Medication,
  AdminPanelSettings,
  PushPin,
  PushPinOutlined,
  Description,
  Schedule,
  Report,
  Groups,
  Article,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 60;

export default function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  
  // Redux state
  const scheduleCompleted = useAppSelector((state) => state.appointment.isScheduleCompleted);
  const profileState = useAppSelector((state) => state.profile);
  
  // Debug: Log user object and profile to see what's available
  useEffect(() => {
    if (user) {
      console.log('NavigationDrawer - User object:', user);
      console.log('NavigationDrawer - User groups (https://lukariagroup.com/roles):', user['https://lukariagroup.com/roles']);
      console.log('NavigationDrawer - User groups (groups):', user.groups);
    }
  }, [user]);

  // Debug: Log profile state
  useEffect(() => {
    console.log('📋 NavigationDrawer - Profile State:', {
      isLoaded: profileState.isLoaded,
      hasProfile: !!profileState.profile,
      profileData: profileState.profile,
      consultationOccurred: profileState.profile?.user_metadata?.consultationOccurred,
    });
  }, [profileState]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is in doctor or admin group using processed custom claims
  const isAdmin = user && 
    // Check processed custom claims first
    (user?.groups && user.groups.some(item => item.toLowerCase() === "doctor" || item.toLowerCase() === "admin"));

  // Hide navigation drawer on public marketing pages
  if (
    pathname === '/privacy-policy' ||
    pathname === '/terms' ||
    pathname === '/about' ||
    pathname === '/ads' ||
    pathname === '/glp-1-weight-loss' ||
    pathname === '/testimonials'
  ) {
    return null;
  }

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handlePinToggle = () => {
    const newPinnedState = !pinned;
    setPinned(newPinnedState);
    
    if (newPinnedState) {
      setOpen(true);
    }
  };

  // Build navigation items based on user access
  const navigationItems = [
    // Basic access items - Admin and Patient
    ...(canAccessPage(user, 'basic', profileState.profile) ? [
      {
        text: 'Dashboard',
        icon: <Dashboard />,
        path: '/dashboard',
      },
      {
        text: 'Profile',
        icon: <Person />,
        path: '/profile',
      },
      {
        text: 'Consent Forms',
        icon: <Description />,
        path: '/consent-forms',
      },
    ] : []),
    
    // Consultation required items - Admin or Patient with consultation
    ...(canAccessPage(user, 'consultation', profileState.profile) ? [
      {
        text: 'Membership Area',
        icon: <Groups />,
        path: '/membership',
      },
      {
        text: 'Side Effects',
        icon: <MedicalServices />,
        path: '/side-effects',
      },
      {
        text: 'Weight Logging',
        icon: <Scale />,
        path: '/weight-logging',
      },
      {
        text: 'Medication Tracker',
        icon: <Medication />,
        path: '/medication-tracker',
      },
      {
        text: 'Meal Tracker',
        icon: <Restaurant />,
        path: '/meal-tracker',
      },
    ] : []),
    
    // Admin portal - Admin and Doctor only
    ...(canAccessPage(user, 'admin', profileState.profile) ? [
      {
        text: 'Administration',
        icon: <AdminPanelSettings />,
        path: '/admin',
      },
      {
        text: 'Manage Blog',
        icon: <Article />,
        path: '/blog',
      },
      {
        text: 'Reschedule Requests',
        icon: <Schedule />,
        path: '/admin/reschedule-requests',
      },
      {
        text: 'Side Effects Reports',
        icon: <Report />,
        path: '/admin/side-effects',
      },
    ] : []),
  ];

  const handleNavigation = (path) => {
    router.push(path);
    if (!pinned) {
      setOpen(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Hide navigation drawer on login page (home page when user is not authenticated)
  // Hide on schedule page unless schedule is completed
  // Hide on FAQ page
  // Also hide during loading to prevent hydration mismatch
  if ((pathname === '/' && !user) || isLoading) {
    return null;
  }

  // Hide navigation drawer on schedule page unless completed
  if (pathname === '/schedule' && !scheduleCompleted) {
    return null; // Hide navigation drawer
  }

  // Hide navigation drawer on FAQ page
  if (pathname === '/faq') {
    return null;
  }

  // Hide navigation drawer on Contact page
  if (pathname === '/contact') {
    return null;
  }

  // Hide navigation drawer on Info page
  if (pathname === '/info') {
    return null;
  }

  // Hide navigation drawer on Blog page (uses its own nav)
  if (pathname === '/blog' || pathname?.startsWith?.('/blog/')) {
    return null;
  }

  // Hide navigation drawer on Unauthorized page
  if (pathname === '/unauthorized') {
    return null;
  }

  // Hide navigation drawer on Consultation Required page
  if (pathname === '/consultation-required') {
    return null;
  }

  return (
    <>
      {/* Menu Button */}
      <IconButton
        color="inherit"
        aria-label="toggle drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#000000',
          color: '#877449',
          boxShadow: 2,
          '&:hover': {
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
          },
        }}
      >
        <MenuIcon />
      </IconButton>


      {/* Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={pinned ? undefined : handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
          hideBackdrop: pinned,
        }}
        sx={{
          display: { xs: 'block' },
          ...(pinned && { pointerEvents: 'none' }),
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundColor: '#000000',
            borderRight: '1px solid',
            borderColor: 'divider',
            ...(pinned && { pointerEvents: 'auto' }),
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#000000', 
          color: '#877449',
          minHeight: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" component="div" className="Svelte_logo" sx={{ marginLeft: '20px' }}>
            Svelte
          </Typography>
          <IconButton
            color="inherit"
            aria-label={pinned ? "unpin drawer" : "pin drawer"}
            onClick={handlePinToggle}
            size="small"
          >
            {pinned ? <PushPin /> : <PushPinOutlined />}
          </IconButton>
        </Box>
        
        <Divider />
        
        <List sx={{ pt: 2 }}>
          {navigationItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={pathname === item.path}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    color: '#877449',
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.3)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#877449',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: '#877449',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.path ? 'bold' : 'normal',
                    color: '#877449',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}
