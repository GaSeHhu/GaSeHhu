import React, { useEffect, useRef, useState } from 'react';
import { AttachFile, Chat as ChatIcon, ContentCopy as ContentCopyIcon, ExpandLess, ExpandMore, InsertPhoto, Send as SendIcon } from '@mui/icons-material';
import { AvatarGroup, Box, ButtonGroup, CircularProgress, Collapse, Divider, Grid, IconButton, InputBase, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import { ChatMessage, FileAttachmentMessage, Guest, Host, MemberJoinedMessage, MemberLeftMessage, Participant, PictureMessage, Room, TextMessage, TimestampedMessage } from '../lib/Client';
import { User } from '../lib/User';
import { useDebug, useTimeout, useUnload } from '../lib/common';
import { UserAvatar } from './UserAvatar';
import { localize } from '../lib/i18n';
import { Footer } from './Footer';
import ZoomableImage from './ZoomableImage';
import { DownloadFileAttachmentCard } from './DownloadFileAttachmentCard';

function Header(props: {
  participant: Participant;
}) {
  return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper', justifyContent: 'center', display: 'flex', mt: 4 }}>
      <Typography
        variant="h5"
        fontWeight="fontWeightBold"
      >
        {localize('gasehhu')}
      </Typography>
    </Box>
  );
}

function RoomLink() {
  const [show, setShow] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const flip = () => setShow(prev => !prev);

  useTimeout(() => {
    setCopied(false);
  }, 3000, [copied])

  const link = document.location.href;
  return (
    <>
      <ListItemButton onClick={flip}>
        <ListItemText primary={localize('room')} primaryTypographyProps={{
          variant: "h6"
        }} />
        {show ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={show} timeout="auto" unmountOnExit>
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
                  setCopied(true);
                }}>
                  <ContentCopyIcon/>
                </IconButton>
              ),
            }}
          />
        </Box>
      </Collapse>
    </>
  );
}

function MemberList(props: {
  members: Array<User>;
}) {
  const [show, setShow] = useState<boolean>(true);
  const flip = () => setShow(prev => !prev);
  return (
    <>
      <ListItemButton onClick={flip}>
        <ListItemText primary={localize('members')} primaryTypographyProps={{
          variant: "h6"
        }}/>
        {show ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={show} timeout="auto" unmountOnExit>
        <AvatarGroup max={7} sx={{ justifyContent: 'center' }}>
          {
            props.members.map((member, i) =>
              <UserAvatar key={i} user={member} online tooltip/>
            )
          }
        </AvatarGroup>
      </Collapse>
    </>
  );
}

function Sidebar(props: {
  participant: Participant;
  members: Array<User>;
}) {
  return (
    <>
      <List component="div" sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}>
        <RoomLink/>
        <MemberList members={props.members}/>
        <Footer/>
      </List>
    </>
  )
}

function Message(props: {
  whom: User;
  children: React.ReactNode;
  align: 'left' | 'right';
}) {
  return (
    <ListItem alignItems="flex-start" sx={{ textAlign: props.align }}>
      {
        props.align === 'left' && <ListItemAvatar sx={{ display: 'flex', justifyContent: 'left' }}>
          <UserAvatar user={props.whom}/>
        </ListItemAvatar>
      }
      <Grid container>
        <Grid item xs={12}>
          <ListItemText secondary={
            <>
              <Typography
                sx={{ display: 'inline' }}
                component="span"
                variant="body2"
                color="text.secondary"
              >
                {props.whom.nickname}
              </Typography>
            </>
          }/>
        </Grid>
        <Grid item xs={12} sx={{
          // 'img': {
          //   maxWidth: 400,
          //   maxHeight: 480,
          // },
        }}>
          <ListItemText primary={props.children}></ListItemText>
        </Grid>
      </Grid>
      {
        props.align === 'right' && <ListItemAvatar sx={{ display: 'flex', justifyContent: 'right' }}>
          <UserAvatar user={props.whom}/>
        </ListItemAvatar>
      }
    </ListItem>
  );
}

function MessageTextbox(props: {
  participant?: Participant;
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
        <IconButton color="primary" aria-label="upload picture" component="label">
          <input ref={pictureInputRef} hidden accept="image/*" type="file" onChange={sendPicture} />
          <InsertPhoto />
        </IconButton>
        <IconButton color="primary" aria-label="upload file" component="label">
          <input ref={fileAttachmentInputRef} hidden accept="*/*" type="file" onChange={sendFile} />
          <AttachFile />
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
          disabled={!Boolean(props.participant)}
          value={messageBoxValue}
          onChange={e => setMessageBoxValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              sendMessage();
            }
          }}
          onPaste={sendPictureFromClipboard}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          color="secondary"
          sx={{ p: '10px' }}
          aria-label="directions"
          disabled={!Boolean(props.participant)}
          onClick={sendMessage}
        >
          <SendIcon />
        </IconButton>
      </Grid>
    </>
  );
}

function NoMessagePane() {
  return (
    <Box sx={{
      mt: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    }}>
      <ChatIcon sx={{
        color: '#f5f5f7'
      }}/>
      <Typography variant="caption" color="grey" >{localize('noMessages')}</Typography>
    </Box>
  );
}

function MessagePane(props: {
  participant: Participant;
  members: Array<User>;
  messages: Array<ChatMessage>;
}) {
  if (props.messages.length === 0) {
    return <NoMessagePane/>;
  }
  const membersPerUserId: {[key: string]: User} = {};
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
                    <ZoomableImage maxWidth={400} maxHeight={480} alt='' src={pictureMessage.src}/>
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
                  <DownloadFileAttachmentCard fileAttachment={fileAttachment}/>
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
        })
      })()}
    </List>
  );
}

function LoadingChatRoom() {
  return (
    <CircularProgress sx={{
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)'
    }} color="secondary" />
  );
}

interface ParticipantNotCreated {
  loading: true;
  ready: false;
  participant: null;
}

interface ParticipantNotReady {
  loading: false;
  ready: false;
  participant: Participant;
}

interface ParticipantReady {
  loading: false;
  ready: true;
  participant: Participant;
}

type ParticipantState = ParticipantNotCreated | ParticipantNotReady | ParticipantReady;

function ChatRoom(props: {
  room: Room;
  user: User;
}) {
  const {debug} = useDebug();
  const [participantState, setParticipantState] = useState<ParticipantState>({
    loading: true,
    ready: false,
    participant: null,
  });

  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const appendMessage = (newMessage: ChatMessage) => {
    setMessages(history => [
      ...history,
      newMessage,
    ]);
  };

  const [members, setMembers] = useState<Array<User>>([props.user]);

  useUnload(e => {
    participantState.participant?.disconnect(); // TODO: reconnect if not closed
    e.returnValue = 'Conversation will be closed permanently. Are you sure?';
  });

  useEffect(() => {
    if (!participantState.loading || participantState.ready || participantState.participant) {
      return;
    }
    let hostOrGuest: Participant;
    if (props.room.roomId === props.user.userId) {
      hostOrGuest = new Host({
        room: props.room,
        user: props.user,
        debug,
      });
    } else {
      hostOrGuest = new Guest({
        room: props.room,
        user: props.user,
        debug,
      });
    }
    hostOrGuest.on('ready', () => setParticipantState({
      loading: false,
      ready: true,
      participant: hostOrGuest,
    })); // TODO: if host is not available
    hostOrGuest.on('text', appendMessage);
    hostOrGuest.on('picture', appendMessage);
    hostOrGuest.on('file', appendMessage);
    hostOrGuest.on('joined', appendMessage);
    hostOrGuest.on('left', appendMessage);
    hostOrGuest.on('members', message => {
      setMembers(message.members);
      appendMessage(message);
    });
    setParticipantState({
      loading: false,
      ready: false,
      participant: hostOrGuest,
    });
  }, [
    debug,
    props.room.roomId,
    props.user.userId,
    participantState.loading,
    participantState.ready,
    participantState.participant,
  ]);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  if (participantState.loading || !participantState.ready) {
    return <LoadingChatRoom/>;
  }

  return (
    <>
      <Grid container spacing={2} sx={{
        position: 'fixed',
        height: '100%',
        overflow: 'scroll',
        // '-ms-overflow-style': 'none',
        // 'scrollbar-width': 'none',
        '::-webkit-scrollbar': { 
          display: 'none',
        },
        display: {
          'xs': 'none',
          'sm': 'none',
          'md': 'block'
        },
      }}>
        <Grid item md={3}>
          <Sidebar participant={participantState.participant} members={members}/>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item md={3} sm={0} xs={0}/>
        <Grid item md={9} sm={12} xs={12}>
          <MessagePane participant={participantState.participant} members={members} messages={messages}/>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ position: 'fixed', bottom: 0 }}>
        <Grid item md={3} sm={0} xs={0}/>
        <Grid item md={9} sm={12} xs={12}>
          <MessageTextbox participant={participantState.participant}/>
        </Grid>
      </Grid>
    </>
  );
}

export default ChatRoom;
