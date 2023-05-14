import React from 'react';
import { Divider, List, Paper, Typography } from '@mui/material';
import { ChatMessage, FileAttachmentMessage, MemberJoinedMessage, MemberLeftMessage, Participant, PictureMessage, TextMessage, TimestampedMessage } from '../../lib/Client';
import { User } from '../../lib/User';
import { localize } from '../../lib/i18n';
import ZoomableImage from '../ZoomableImage';
import { DownloadFileAttachmentCard } from '../DownloadFileAttachmentCard';
import Message from './Message';
import { NoMessagePane } from './NoMessagePane';

export default function MessagePane(props: {
  participant: Participant;
  members: Array<User>;
  messages: Array<ChatMessage>;
}) {
  if (props.messages.length === 0) {
    return <NoMessagePane />;
  }
  const membersPerUserId: { [key: string]: User; } = {};
  for (let member of props.members) {
    membersPerUserId[member.userId] = member;
  }
  return (
    <List sx={{ pb: 10 }}>
      {(() => {
        let lastTimeDividerValue: string | null = null;
        return props.messages.flatMap((message, i) => {
          const maybeDivider = (message: TimestampedMessage): React.ReactNode[] => {
            const date = new Date(message.timestamp);
            const hours: string = date.getHours() < 10 ? '0' + date.getHours() : date.getHours().toString();
            const minutes: string = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes().toString();
            const timeDividerValue = `${hours}:${minutes}`;

            const maybeTimeDivider = timeDividerValue !== lastTimeDividerValue ? [
              <li key={`DividerValue-${i}`}>
                <Typography
                  sx={{ mt: 0.5, ml: 2, textAlign: 'center' }}
                  color="text.secondary"
                  display="block"
                  variant="caption"
                >
                  {timeDividerValue}
                </Typography>
              </li>,
              <Divider key={`Divider-${i}`} component="li" />
            ] : [];
            lastTimeDividerValue = timeDividerValue;
            return maybeTimeDivider;
          };
          switch (message.type) {
            case 'Text':
              const textMessage = message as TextMessage;
              return [
                ...maybeDivider(textMessage),
                <Message
                  key={`Message-${i}`}
                  align={textMessage.onBehalfOf === props.participant?.user.userId ? 'right' : 'left'}
                  whom={{
                    userId: textMessage.onBehalfOf,
                    nickname: membersPerUserId[textMessage.onBehalfOf]?.nickname ?? textMessage.onBehalfOf,
                  }}
                >
                  {textMessage.text}
                </Message>
              ];
            case 'Picture':
              const pictureMessage = message as PictureMessage;
              return [
                ...maybeDivider(pictureMessage),
                <Message
                  key={`Message-${i}`}
                  align={pictureMessage.onBehalfOf === props.participant?.user.userId ? 'right' : 'left'}
                  whom={{
                    userId: pictureMessage.onBehalfOf,
                    nickname: membersPerUserId[pictureMessage.onBehalfOf]?.nickname ?? pictureMessage.onBehalfOf,
                  }}
                >
                  <Paper elevation={0} sx={{
                    display: 'inline-block',
                    p: 1,
                    border: '1px solid #f6f6f6',
                  }}>
                    <ZoomableImage maxWidth={400} maxHeight={480} alt='' src={pictureMessage.src} />
                  </Paper>
                </Message>
              ];
            case 'File':
              const fileAttachment = message as FileAttachmentMessage;
              return [
                ...maybeDivider(fileAttachment),
                <Message
                  key={`Message-${i}`}
                  align={fileAttachment.onBehalfOf === props.participant?.user.userId ? 'right' : 'left'}
                  whom={{
                    userId: fileAttachment.onBehalfOf,
                    nickname: membersPerUserId[fileAttachment.onBehalfOf]?.nickname ?? fileAttachment.onBehalfOf,
                  }}
                >
                  <DownloadFileAttachmentCard fileAttachment={fileAttachment} />
                </Message>
              ];
            case 'MemberJoined':
              const joined = message as MemberJoinedMessage;
              return (
                <li key={`MemberJoined-${i}`}>
                  <Typography
                    sx={{ mt: 0.5, ml: 2, textAlign: 'center' }}
                    color="text.secondary"
                    display="block"
                    variant="caption"
                  >
                    {joined.member.nickname ?? joined.member.userId} {localize('joined')}{localize('.')}
                  </Typography>
                </li>
              );
            case 'MemberLeft':
              const left = message as MemberLeftMessage;
              return (
                <li key={`MemberLeft-${i}`}>
                  <Typography
                    sx={{ mt: 0.5, ml: 2, textAlign: 'center' }}
                    color="text.secondary"
                    display="block"
                    variant="caption"
                  >
                    {left.member.nickname ?? left.member.userId} {localize('left')}{localize('.')}
                  </Typography>
                </li>
              );
            default:
              return [];
          }
        });
      })()}
    </List>
  );
}
