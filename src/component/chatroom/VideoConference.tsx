import React, { useState } from 'react';

import { Dialog, DialogActions, IconButton, styled, useMediaQuery, useTheme } from '@mui/material';
import MediaStreamVideo from '../MediaStreamVideo';
import { PhoneDisabled as PhoneDisabledIcon, ZoomInMap as ZoomInMapZoom } from '@mui/icons-material';
import VideoVolumeIcon from './VideoVolumeIcon';

const Video = styled(MediaStreamVideo)((theme) => ({
  position: 'relative',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  background: '#000',
  objectFit: 'cover',
  overflow: 'hidden',
  backgroundSize: 'cover',
}));

function ResponsibleFullScreenVideoDialog(props: {
  children?: React.ReactNode;
  fullScreen: boolean;
  muted?: boolean;
  onMute?: () => void;
  onUnmute?: () => void;
  onCallEnded?: () => void;
  onFullScreenClosed?: () => void;
}) {
  return (
    <Dialog fullScreen={props.fullScreen}
      open={true}
      onClose={props.onFullScreenClosed}
      maxWidth="lg"
    >
      {props.children}
      <DialogActions sx={{
        justifyContent: 'center',
      }}>
        <IconButton color="default" onClick={props.onFullScreenClosed}>
          <ZoomInMapZoom/>
        </IconButton>
        <IconButton color="default" onClick={() => props.muted ? props.onUnmute?.() : props.onMute?.()}>
          <VideoVolumeIcon muted={props.muted}/>
        </IconButton>
        <IconButton color="error" onClick={props.onCallEnded}>
          <PhoneDisabledIcon/>
        </IconButton>
      </DialogActions>
    </Dialog>
  )
}

export default function VideoConference(props: {
  local: MediaStream;
  remote?: MediaStream;
  muted?: boolean;
  onMute?: () => void;
  onUnmute?: () => void;
  onCallEnded?: () => void;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [preview, setPreview] = useState<boolean>(true);

  if (preview) {
    return (
      <Video
        srcObject={props.remote ?? props.local}
        autoPlay
        playsInline
        muted={props.remote ? props.muted : true}
        sx={{
          position: 'fixed',
          bottom: 'initial',
          left: 'initial',
          top: {
            lg: 24,
            md: 24,
            sm: 8,
            xs: 8,
          },
          right: {
            lg: 24,
            md: 24,
            sm: 8,
            xs: 8,
          },
          height: {
            lg: 240,
            md: 180,
            sm: 160,
            xs: 120,
          },
          width: 'auto',
          cursor: 'pointer',
        }}
        onClick={() => setPreview(false)}
      />
    );
  }

  return (
    <ResponsibleFullScreenVideoDialog
      fullScreen={fullScreen}
      muted={props.muted}
      onMute={props.onMute}
      onUnmute={props.onUnmute}
      onCallEnded={props.onCallEnded}
      onFullScreenClosed={() => setPreview(true)}
    >
      <Video
        srcObject={props.remote ?? props.local}
        autoPlay
        playsInline
        muted={props.remote ? props.muted : true}
        sx={{ cursor: 'pointer' }}
        onClick={() => setPreview(true)}
      />
    </ResponsibleFullScreenVideoDialog>
  )
}
