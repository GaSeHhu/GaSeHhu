import React from 'react';
import { Box } from '@mui/material';

export default function FullScreenCentered(props: {
  children: React.ReactNode[];
}) {
  return (
    <Box sx={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
    }}>
      {props.children}
    </Box>
  );
}