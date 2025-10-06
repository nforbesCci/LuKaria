'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#a59a7d',
      light: '#E6C65A',
      dark: '#B8941F',
    },
    secondary: {
      main: '#dc004e',
    },
    gold: {
      main: '#a59a7d',
      light: '#E6C65A',
      dark: '#B8941F',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#a59a7d',
      secondary: '#C0C0C0',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          borderColor: '#2E3136',
          '&:hover': {
            borderColor: '#2E3136',
          },
          '&.Mui-disabled': {
            backgroundColor: '#36454F',
            color: '#C0C0C0',
            borderColor: '#36454F',
            '&:hover': {
              backgroundColor: '#36454F',
              borderColor: '#36454F',
            },
          },
        },
        outlined: {
          borderColor: '#2E3136',
          '&:hover': {
            borderColor: '#2E3136',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#2E3136',
            },
            '&:hover fieldset': {
              borderColor: '#2E3136',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a59a7d',
            },
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#2E3136',
            },
            '&:hover fieldset': {
              borderColor: '#2E3136',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#a59a7d',
            },
          },
        },
      },
    },
  },
});
