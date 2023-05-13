import { Box, styled } from "@mui/material";
import { ImgHTMLAttributes, useState } from "react";

export interface ZoomableImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  maxHeight: number;
  maxWidth: number;
}

export default function ZoomableImage(props: ZoomableImageProps) {
  const { maxHeight, maxWidth, ...imageProps } = props;

  const [zoom, setZoom] = useState<boolean>(false);
  const flip = () => setZoom(prev => !prev);

  const PreviewBox = styled(Box)({
    cursor: 'pointer',
    'img': {
      maxHeight,
      maxWidth,
    },
  });

  const MaxSizedBox = styled(Box)({
    cursor: 'pointer',
    'img': {
      maxWidth: '100%',
      maxHeight: 'auto',
    },
  });

  return zoom ? (
    <MaxSizedBox onClick={flip}>
      <img {...imageProps}/>
    </MaxSizedBox>
  ) : (
    <PreviewBox onClick={flip}>
      <img {...imageProps}/>
    </PreviewBox>
  );
}
