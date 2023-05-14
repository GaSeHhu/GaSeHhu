import React from 'react';
import { Chat as ChatIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { localize } from '../../lib/i18n';

export function NoMessagePane() {
  return (
    <Box sx={{
      mt: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <ChatIcon sx={{
        color: '#f5f5f7'
      }} />
      <Typography variant="caption" color="grey">{localize('noMessages')}</Typography>
    </Box>
  );
}
