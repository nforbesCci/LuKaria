'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { usePathname } from 'next/navigation';
import { createTheme } from '@mui/material/styles';
import { isPublicPath } from '../lib/public-paths';

// Light theme for public pages
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#877449',
      light: '#E6C65A',
      dark: '#B8941F',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
});

// Dark theme for authenticated pages
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#877449',
      light: '#E6C65A',
      dark: '#B8941F',
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#877449',
      secondary: '#C0C0C0',
    },
  },
});

export default function ThemeProvider({ children }) {
  const pathname = usePathname() || '';

  // Pathname-first avoids a light→dark flash while Auth0 hydrates on app/doctor pages (CLS).
  // Marketing URLs always use light theme, including when a session exists before redirect.
  const currentTheme = isPublicPath(pathname) ? lightTheme : darkTheme;
  
  return (
    <MuiThemeProvider theme={currentTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
