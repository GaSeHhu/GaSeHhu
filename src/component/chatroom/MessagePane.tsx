import React from 'react';
import { List, Paper, Typography } from '@mui/material';
import { ChatMessage, FileAttachmentMessage, MemberJoinedMessage, MemberLeftMessage, Participant, PictureMessage, TextMessage, TimestampedMessage } from '../../lib/Client';
import { User } from '../../lib/User';
import { localize } from '../../lib/i18n';
import ZoomableImage from '../ZoomableImage';
import { DownloadFileAttachmentCard } from '../DownloadFileAttachmentCard';
import Message from './Message';
import { NoMessagePane } from './NoMessagePane';

function TimeDividerItem(props: {
  children: React.ReactNode;
}) {
  return (
    <>
      <li>
        <Typography
          sx={{ mt: 0.5, ml: 2, textAlign: 'center' }}
          color="text.secondary"
          display="block"
          variant="caption"
        >
          {props.children}
        </Typography>
      </li>
    </>
  );
}

function SimpleMessageItem(props: {
  children?: React.ReactNode;
}) {
  return (
    <li>
      <Typography
        sx={{ mt: 0.5, ml: 2, textAlign: 'center' }}
        color="text.secondary"
        display="block"
        variant="caption"
      >
        {props.children}
      </Typography>
    </li>
  );
}

function FileAttachmentMessageItem(props: {
  fileAttachment: FileAttachmentMessage;
  whom: User;
  align: 'left' | 'right';
}) {
  return (
    <Message
      align={props.align}
      whom={props.whom}
    >
      <DownloadFileAttachmentCard fileAttachment={props.fileAttachment} />
    </Message>
  );
}

function PictureMessageItem(props: {
  picture: PictureMessage;
  whom: User;
  align: 'left' | 'right';
}) {
  return (
    <Message
      align={props.align}
      whom={props.whom}
    >
      <Paper elevation={0} sx={{
        display: 'inline-block',
        p: 1,
        border: '1px solid #f6f6f6',
      }}>
        <ZoomableImage maxWidth={400} maxHeight={480} alt='pic' src={props.picture.src} />
      </Paper>
    </Message>
  )
}

export default function MessagePane(props: {
  participant?: Participant;
  members: Array<User>;
  messages: Array<ChatMessage>;
  dismissed?: boolean;
}) {
  if (!props.dismissed && props.messages.length === 0) {
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
              <TimeDividerItem key={`Divider-${i}`}>
                {timeDividerValue}
              </TimeDividerItem>
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
                <PictureMessageItem
                  key={`Message-${i}`}
                  align={pictureMessage.onBehalfOf === props.participant?.user.userId ? 'right' : 'left'}
                  whom={{
                    userId: pictureMessage.onBehalfOf,
                    nickname: membersPerUserId[pictureMessage.onBehalfOf]?.nickname ?? pictureMessage.onBehalfOf,
                  }}
                  picture={pictureMessage}
                />
              ];
            case 'File':
              const fileAttachment = message as FileAttachmentMessage;
              return [
                ...maybeDivider(fileAttachment),
                <FileAttachmentMessageItem
                  key={`Message-${i}`}
                  align={fileAttachment.onBehalfOf === props.participant?.user.userId ? 'right' : 'left'}
                  whom={{
                    userId: fileAttachment.onBehalfOf,
                    nickname: membersPerUserId[fileAttachment.onBehalfOf]?.nickname ?? fileAttachment.onBehalfOf,
                  }}
                  fileAttachment={fileAttachment}
                />
              ];
            case 'MemberJoined':
              const joined = message as MemberJoinedMessage;
              return (
                <SimpleMessageItem key={`MemberJoined-${i}`}>
                  {joined.member.nickname ?? joined.member.userId} {localize('joined')}{localize('.')}
                </SimpleMessageItem>
              );
            case 'MemberLeft':
              const left = message as MemberLeftMessage;
              return (
                <SimpleMessageItem key={`MemberLeft-${i}`}>
                  {left.member.nickname ?? left.member.userId} {localize('left')}{localize('.')}
                </SimpleMessageItem>
              );
            default:
              return [];
          }
        });
      })()}
      {
        props.dismissed && (
          <SimpleMessageItem>
            {localize('roomDismissed')}{localize('.')}
          </SimpleMessageItem>
        )
      }
    </List>
  );
}
