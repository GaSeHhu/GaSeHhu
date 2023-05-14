import React, { useState } from 'react';

import { TextField, Typography, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import { useTimeout } from '../../lib/common';
import FireGTagEvents from '../../lib/GTagEvents';
import { localize } from '../../lib/i18n';
import CollapsibleListItem from '../CollapsibleListItem';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';

export default function RoomLinkItem() {
  const [copied, setCopied] = useState<boolean>(false);

  useTimeout(() => {
    setCopied(false);
  }, 3000, [copied])

  const link = document.location.href;
  return (
    <CollapsibleListItem
      headerTextProps={{
        primary: localize('room'),
        primaryTypographyProps: {
          variant: "h6"
        },
      }}
    >
      <Box sx={{ ml: 2, mr: 2, mb: 3 }}>
        <TextField
          label={localize('sharedTheLink')}
          variant="standard"
          color="secondary"
          value={link}
          fullWidth
          helperText={copied ? <Typography variant="caption">{localize('copied')}</Typography> : <></>}
          inputProps={{
            style: {
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            },
            onFocus: e => {
              e.target.select();
              e.target.setSelectionRange(0, link.length);
            },
          }}
          InputProps={{ 
            readOnly: true,
            endAdornment: (
              <IconButton edge="end" onClick={() => {
                navigator.clipboard.writeText(link);
                FireGTagEvents.share();
                setCopied(true);
              }}>
                <ContentCopyIcon/>
              </IconButton>
            ),
          }}
        />
      </Box>
    </CollapsibleListItem>
  );
}
