'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  Block,
  Home,
} from '@mui/icons-material';
import Header from '../../components/Header';

export default function UnauthorizedPage() {
  const { user } = useUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', backgroundColor: '#1a1a1a' }}>
          <Block sx={{ fontSize: 80, color: '#ff4444', mb: 2 }} />
          
          <Typography variant="h3" gutterBottom sx={{ color: '#877449', fontWeight: 'bold' }}>
            Access Denied
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
            You don't have permission to access this page
          </Typography>
          
          <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              This page is restricted to specific user roles. If you believe you should have access,
              please contact your administrator.
            </Typography>
          </Alert>

          {user && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#2C3E50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Logged in as: <strong>{user.email}</strong>
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => router.push('/dashboard')}
            sx={{
              backgroundColor: '#877449',
              color: '#000',
              px: 4,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#B8941F',
              }
            }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    </>
  );
}

