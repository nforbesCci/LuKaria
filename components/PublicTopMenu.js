'use client';

import { useMemo, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const MENU_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Info', href: '/info' },
  { label: 'GLP-1', href: '/glp-1-weight-loss' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

export default function PublicTopMenu({ currentPath = '' }) {
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const currentLabel = useMemo(
    () => MENU_ITEMS.find((i) => i.href === currentPath)?.label || 'Menu',
    [currentPath]
  );

  const goTo = (href) => {
    window.location.href = href;
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          backgroundColor: '#877449',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          zIndex: 1001,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 4,
          }}
        >
          {MENU_ITEMS.map((item) => (
            <Typography
              key={item.href}
              variant="body2"
              sx={{
                color: '#000000',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: currentPath === item.href ? 'underline' : 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => goTo(item.href)}
            >
              {item.label}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: { xs: user ? 'none' : 'flex', md: 'none' },
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <IconButton onClick={() => setOpen(true)} size="small" aria-label="Open menu">
            <MenuIcon sx={{ color: '#000' }} />
          </IconButton>
          <Typography variant="body2" sx={{ color: '#000', fontWeight: 700 }}>
            {currentLabel}
          </Typography>
          <Box sx={{ width: 32 }} />
        </Box>
      </Box>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280 }} role="presentation" onClick={() => setOpen(false)}>
          <List>
            {MENU_ITEMS.map((item) => (
              <ListItemButton
                key={item.href}
                selected={currentPath === item.href}
                onClick={() => goTo(item.href)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
