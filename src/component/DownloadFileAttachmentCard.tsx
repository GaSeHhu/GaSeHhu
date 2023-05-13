import { Download } from "@mui/icons-material";
import { Card, CardHeader, IconButton } from "@mui/material";
import { FileAttachmentMessage } from "../lib/Client";

export function DownloadFileAttachmentCard(props: {
  fileAttachment: FileAttachmentMessage;
}) {
  return (
    <Card sx={{ display: 'inline-block', maxWidth: 345 }}>
      <CardHeader
        avatar={
          <IconButton LinkComponent='a' aria-label="settings" href={props.fileAttachment.src} download={props.fileAttachment.filename}>
            <Download />
          </IconButton>
        }
        title={props.fileAttachment.filename}
      />
    </Card>
  );
}
