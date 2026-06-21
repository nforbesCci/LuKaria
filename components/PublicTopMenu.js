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
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const GLP1_SUBMENU = [
  { label: 'Ozempic / semaglutide', href: '/ozempic-semaglutide' },
  { label: 'Mounjaro / tirzepatide', href: '/mounjaro-tirzepatide' },
  { label: 'Svelte Sustain', href: '/svelte-sustain' },
  { label: 'Weight loss injections', href: '/weight-loss-injections' },
];

const MENU_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Info', href: '/info' },
  { label: 'GLP-1', href: '/glp-1-weight-loss', submenu: GLP1_SUBMENU },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'About Us', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

const navItemSx = {
  color: '#000000',
  fontWeight: '600',
  cursor: 'pointer',
  '&:hover': { textDecoration: 'underline' },
};

export default function PublicTopMenu({ currentPath = '' }) {
  const [open, setOpen] = useState(false);
  const [glpMenuAnchor, setGlpMenuAnchor] = useState(null);
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
          {MENU_ITEMS.map((item) =>
            item.submenu ? (
              <Box
                key={item.href}
                sx={{ display: 'flex', alignItems: 'center', gap: 0 }}
              >
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    ...navItemSx,
                    textDecoration: currentPath === item.href ? 'underline' : 'none',
                  }}
                  onClick={() => goTo(item.href)}
                >
                  {item.label}
                </Typography>
                <IconButton
                  size="small"
                  aria-label={`${item.label} medication topics`}
                  aria-haspopup="true"
                  aria-expanded={Boolean(glpMenuAnchor)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setGlpMenuAnchor(glpMenuAnchor ? null : e.currentTarget);
                  }}
                  sx={{
                    color: '#000',
                    p: 0,
                    ml: -0.25,
                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.06)' },
                  }}
                >
                  <ArrowDropDownIcon sx={{ fontSize: 22 }} />
                </IconButton>
                <Menu
                  anchorEl={glpMenuAnchor}
                  open={Boolean(glpMenuAnchor)}
                  onClose={() => setGlpMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                  PaperProps={{
                    sx: {
                      mt: 0.5,
                      backgroundColor: '#faf6ef',
                      border: '1px solid #877449',
                      minWidth: 220,
                    },
                  }}
                >
                  {item.submenu.map((sub) => (
                    <MenuItem
                      key={sub.href}
                      onClick={() => {
                        setGlpMenuAnchor(null);
                        goTo(sub.href);
                      }}
                      sx={{ color: '#000', fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      {sub.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            ) : (
              <Typography
                key={item.href}
                variant="body2"
                sx={{
                  ...navItemSx,
                  textDecoration: currentPath === item.href ? 'underline' : 'none',
                }}
                onClick={() => goTo(item.href)}
              >
                {item.label}
              </Typography>
            )
          )}
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
            {MENU_ITEMS.map((item) =>
              item.submenu ? (
                <Box key={item.href}>
                  <ListItemButton
                    selected={currentPath === item.href}
                    onClick={() => goTo(item.href)}
                  >
                    <ListItemText primary={item.label} secondary="Program overview" />
                  </ListItemButton>
                  {item.submenu.map((sub) => (
                    <ListItemButton
                      key={sub.href}
                      sx={{ pl: 4, py: 0.75 }}
                      onClick={() => goTo(sub.href)}
                    >
                      <ListItemText
                        primary={sub.label}
                        primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 600 } }}
                      />
                    </ListItemButton>
                  ))}
                </Box>
              ) : (
                <ListItemButton
                  key={item.href}
                  selected={currentPath === item.href}
                  onClick={() => goTo(item.href)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              )
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
