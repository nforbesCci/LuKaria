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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Schedule,
  Home,
  CheckCircle,
} from '@mui/icons-material';
import Header from '../../components/Header';

export default function ConsultationRequiredPage() {
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
        <Paper elevation={3} sx={{ p: 4, backgroundColor: '#1a1a1a' }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Schedule sx={{ fontSize: 80, color: '#877449', mb: 2 }} />
            
            <Typography variant="h3" gutterBottom sx={{ color: '#877449', fontWeight: 'bold' }}>
              Consultation Required
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
              You need to complete your initial consultation before accessing this feature
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Access to tracking features is available after your first consultation with our healthcare provider.
            </Typography>
          </Alert>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ color: '#877449', mb: 2 }}>
              What happens during your consultation:
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#877449' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Review of your medical history and goals"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#877449' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Discussion of treatment options and medications"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#877449' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Creation of your personalized weight loss plan"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#877449' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Access to all tracking and monitoring tools"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Box>

          {user && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#2C3E50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Logged in as: <strong>{user.email}</strong>
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={() => router.push('/dashboard')}
              sx={{
                borderColor: '#877449',
                color: '#877449',
                px: 3,
                py: 1.5,
                '&:hover': {
                  borderColor: '#877449',
                  backgroundColor: 'rgba(135, 116, 73, 0.1)',
                }
              }}
            >
              Return to Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}

