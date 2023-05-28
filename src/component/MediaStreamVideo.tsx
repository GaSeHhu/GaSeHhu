import React, { useCallback, VideoHTMLAttributes } from 'react';

export type MediaStreamVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  srcObject: MediaStream;
}

export default function MediaStreamVideo(props: MediaStreamVideoProps) {
  const {
    srcObject,
    ...otherProps
  } = props;

  const refVideo = useCallback((element: HTMLVideoElement) => {
    if (element) {
      element.srcObject = srcObject;
    }
  }, [srcObject]);

  return <video ref={refVideo} {...otherProps} />;
}
