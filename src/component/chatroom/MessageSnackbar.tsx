import React, { useEffect, useState } from 'react';
import { Alert, AlertColor, Snackbar } from '@mui/material';

export interface MessageSnackbarProps {
  severity?: AlertColor;
  message: string;
  revision?: number;
}

export default function MessageSnackbar(props: MessageSnackbarProps) {
  const [open, setOpen] = useState<boolean>(true);
  const handleClose = () => setOpen(false);
  useEffect(() => {
    if (open) {
      return;
    }
    setOpen(true);
  }, [props.message, props.revision]);
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity={props.severity}>{props.message}</Alert>
    </Snackbar>
  );
}
