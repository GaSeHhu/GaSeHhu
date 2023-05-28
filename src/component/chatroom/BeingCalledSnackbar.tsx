import React from 'react';
import { Button, Snackbar } from '@mui/material';
import { Cancel as CancelIcon, Phone as PhoneIcon } from '@mui/icons-material';

export default function BeingCalledSnackbar(props: {
  calledByWhom: string;
  onAnswer?: () => void;
  onCancel?: () => void;
}) {
  return (
    <Snackbar
      open={true}
      onClose={props.onCancel}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      message={`${props.calledByWhom} is calling...`}
      action={
        <>
          <Button color="inherit" size="small" endIcon={<PhoneIcon />} onClick={props.onAnswer} sx={{ color: 'green' }}>
            Answer
          </Button>
          <Button color="inherit" size="small" endIcon={<CancelIcon />} onClick={props.onCancel} sx={{ color: 'red' }}>
            Refuse
          </Button>
        </>
      }
    />
  );
}
