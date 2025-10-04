'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useAppSelector } from '../store/hooks';
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

  // Debug: Log user object to see what's available
  useEffect(() => {
    if (user) {
      console.log('NavigationDrawer - User object:', user);
      console.log('NavigationDrawer - User groups (https://lukaria.com/groups):', user['https://lukaria.com/groups']);
      console.log('NavigationDrawer - User groups (groups):', user.groups);
      console.log('NavigationDrawer - User roles:', user.roles);
    }
  }, [user]);

  // Check if user is in doctor or admin group
  const isAdmin = user && (
    (user['https://lukaria.com/groups'] && 
     (user['https://lukaria.com/groups'].includes('doctor') || 
      user['https://lukaria.com/groups'].includes('admin'))) ||
    (user.groups && 
     (user.groups.includes('doctor') || user.groups.includes('admin'))) ||
    (user.roles && 
     (user.roles.includes('doctor') || user.roles.includes('admin')))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const navigationItems = [
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
    // Admin-only items
    ...(isAdmin ? [{
      text: 'Administration',
      icon: <AdminPanelSettings />,
      path: '/admin',
    }] : []),
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
          color: '#D4AF37',
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
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundColor: '#000000',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          backgroundColor: '#000000', 
          color: '#D4AF37',
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
                    color: '#D4AF37',
                    '&:hover': {
                      backgroundColor: 'rgba(212, 175, 55, 0.3)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#D4AF37',
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
                    color: '#D4AF37',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.path ? 'bold' : 'normal',
                    color: '#D4AF37',
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
