import React from 'react';
import { Button, Snackbar } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';

export default function CallingSnackbar(props: {
  callingWhom: string;
  onCancel?: () => void;
}) {
  return (
    <Snackbar
      open={true}
      onClose={props.onCancel}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      message={`Calling ${props.callingWhom} ...`}
      action={
        <Button color="inherit" size="small" endIcon={<CancelIcon />} onClick={props.onCancel} sx={{ color: 'red' }}>
          Cancel
        </Button>
      }
    />
  );
}
