import React from 'react';
import { CircularProgress, Typography } from '@mui/material';
import FullScreenCentered from './FullScreenCentered';

export default function LoadingProgress(props: {
  message?: React.ReactNode;
}) {
  return (
    <FullScreenCentered>
      <CircularProgress color="secondary" />
      <Typography variant="body2" sx={{ mt: 3 }}>{props.message}</Typography>
    </FullScreenCentered>
  );
}
