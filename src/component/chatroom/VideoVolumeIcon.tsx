import React, { DOMAttributes, useState } from 'react';

import { VolumeOff as VolumeOffIcon, VolumeUp as VolumeUpIcon } from '@mui/icons-material';

export default function VideoVolumeIcon(props: {
  muted?: boolean;
}) {
  const [mouseEntered, setMouseEntered] = useState<boolean>(false);
  const handleMouseEnter = () => setMouseEntered(true);
  const handleMouseLeave = () => setMouseEntered(false);
  const eventHandlersProps: DOMAttributes<SVGSVGElement> = {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
  const up = <VolumeUpIcon {...eventHandlersProps}/>;
  const off = <VolumeOffIcon {...eventHandlersProps}/>;
  return (
    props.muted ? (
      mouseEntered ? up : off
    ) : (
      mouseEntered ? off : up
    )
  );
}
