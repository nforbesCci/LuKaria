'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import { ExpandMore, BugReport } from '@mui/icons-material';

export default function UserDebug() {
  const { user, isLoading, error } = useUser();
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (user) {
      const info = {
        hasUser: !!user,
        userKeys: Object.keys(user),
        groups: user.groups || 'No groups property',
        roles: user.roles || 'No roles property',
        customGroups: user['https://lukaria.com/groups'] || 'No custom groups',
        appMetadata: user.app_metadata || 'No app_metadata',
        userMetadata: user.user_metadata || 'No user_metadata',
        fullUser: user,
      };
      setDebugInfo(info);
    }
  }, [user]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show debug info in production
  }

  if (isLoading) {
    return (
      <Alert severity="info">
        <Typography>Loading user debug info...</Typography>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        <Typography>Error loading user: {error.message}</Typography>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert severity="warning">
        <Typography>No user logged in</Typography>
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <BugReport sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" color="primary">
            User Debug Information
          </Typography>
        </Box>

        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">User Properties</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {debugInfo?.userKeys.map((key) => (
                <Chip key={key} label={key} size="small" />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Group Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><strong>groups:</strong> {JSON.stringify(debugInfo?.groups)}</Typography>
              <Typography><strong>roles:</strong> {JSON.stringify(debugInfo?.roles)}</Typography>
              <Typography><strong>https://lukaria.com/groups:</strong> {JSON.stringify(debugInfo?.customGroups)}</Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Metadata</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography><strong>app_metadata:</strong> {JSON.stringify(debugInfo?.appMetadata)}</Typography>
              <Typography><strong>user_metadata:</strong> {JSON.stringify(debugInfo?.userMetadata)}</Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded={false}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">Full User Object</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ 
              backgroundColor: '#f0f0f0', 
              p: 2, 
              borderRadius: 1,
              maxHeight: 300,
              overflow: 'auto',
              fontFamily: 'monospace',
              fontSize: '0.8rem'
            }}>
              <pre>{JSON.stringify(debugInfo?.fullUser, null, 2)}</pre>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Box>
  );
}
