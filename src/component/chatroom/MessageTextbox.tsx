import React, { useRef, useState } from 'react';
import { AttachFile, InsertPhoto as InsertPhotoIcon, Send as SendIcon, Videocam as VideocamIcon } from '@mui/icons-material';
import { ButtonGroup, Divider, Grid, IconButton, InputBase } from '@mui/material';
import { Participant } from '../../lib/Client';
import { localize } from '../../lib/i18n';

export default function MessageTextbox(props: {
  participant?: Participant;
  disabled?: boolean;
  videoCallDisabled?: boolean;
  onVideoCall?: () => void;
}) {
  const [messageBoxValue, setMessageBoxValue] = useState<string>('');
  const sendMessage = () => {
    if (messageBoxValue && props.participant) {
      props.participant.sendText(messageBoxValue);
      setMessageBoxValue('');
    }
  };

  const pictureInputRef = useRef<HTMLInputElement>(null);
  const sendPicture = () => {
    if (!pictureInputRef.current) {
      return;
    }
    const picture = pictureInputRef.current.files?.[0];
    if (picture && props.participant) {
      props.participant.sendPicture(picture);
      pictureInputRef.current.files = null;
    }
  };
  const sendPictureFromClipboard = () => {
    navigator.clipboard.read().then(clipboardItems => {
      for (const clipboardItem of clipboardItems) {
        const imageType = clipboardItem.types.filter(type => type.startsWith('image/'))[0];
        if (imageType) {
          clipboardItem.getType(imageType).then(blob => props.participant?.sendPicture(blob));
          return;
        }
      }
    });
  };
  const fileAttachmentInputRef = useRef<HTMLInputElement>(null);
  const sendFile = () => {
    if (!fileAttachmentInputRef.current) {
      return;
    }
    const file = fileAttachmentInputRef.current.files?.[0];
    if (file && props.participant) {
      props.participant.sendFile(file);
      fileAttachmentInputRef.current.files = null;
    }
  };

  return (
    <>
      <ButtonGroup variant="text" aria-label="text button group" sx={{ bgcolor: 'Background.paper' }}>
        <IconButton color="primary" aria-label="upload picture" component="label" disabled={props.disabled}>
          <input ref={pictureInputRef} hidden accept="image/*" type="file" onChange={sendPicture} />
          <InsertPhotoIcon />
        </IconButton>
        <IconButton color="primary" aria-label="upload file" component="label" disabled={props.disabled}>
          <input ref={fileAttachmentInputRef} hidden accept="*/*" type="file" onChange={sendFile} />
          <AttachFile />
        </IconButton>
        <IconButton color="primary" aria-label="video" component="label" disabled={props.disabled || !props.participant || props.videoCallDisabled} onClick={props.onVideoCall}>
          <VideocamIcon />
        </IconButton>
      </ButtonGroup>
      <Divider />
      <Grid
        sx={{ p: '2px 4px 8px 4px', display: 'flex', alignItems: 'center', width: '100%', bgcolor: 'background.paper' }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          autoFocus
          placeholder={localize('messageBoxPlaceholder')}
          inputProps={{ 'aria-label': 'Type something' }}
          disabled={props.disabled || !Boolean(props.participant)}
          value={messageBoxValue}
          onChange={e => setMessageBoxValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          onPaste={sendPictureFromClipboard} />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          color="secondary"
          sx={{ p: '10px' }}
          aria-label="directions"
          disabled={props.disabled || !Boolean(props.participant)}
          onClick={sendMessage}
        >
          <SendIcon />
        </IconButton>
      </Grid>
    </>
  );
}
