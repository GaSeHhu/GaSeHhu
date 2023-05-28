import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { MediaConnection } from 'peerjs';
import { Grid, Link } from '@mui/material';

import { ChatMessage, Guest, Host, Participant, Room } from '../lib/Client';
import { User } from '../lib/User';
import { useDebug, useBeforeUnload, useUnload, useIncrementer } from '../lib/common';
import FireGTagEvents from '../lib/GTagEvents';
import { localize, localizeFn } from '../lib/i18n';

import Sidebar from './chatroom/Sidebar';
import MessageTextbox from './chatroom/MessageTextbox';
import MessagePane from './chatroom/MessagePane';
import LoadingProgress from './LoadingProgress';
import VideoConference from './chatroom/VideoConference';
import CallingSnackbar from './chatroom/CallingSnackbar';
import BeingCalledSnackbar from './chatroom/BeingCalledSnackbar';
import MessageSnackbar, { MessageSnackbarProps } from './chatroom/MessageSnackbar';

interface ParticipantNotCreated {
  loading: true;
  ready: false;
  reconnecting: false;
  dismissed: false;
  participant: null;
}

interface ParticipantNotReady {
  loading: false;
  ready: false;
  reconnecting: false;
  dismissed: false;
  participant: Participant;
}

interface ParticipantReady {
  loading: false;
  ready: true;
  reconnecting: false;
  dismissed: false;
  participant: Participant;
}

interface ParticipantReconnecting {
  loading: boolean;
  ready: boolean;
  reconnecting: true;
  dismissed: false;
  participant: Participant;
}

interface RoomDismissed {
  loading: false;
  ready: true;
  reconnecting: false;
  dismissed: true;
  participant: null;
}

type ParticipantState = ParticipantNotCreated | ParticipantNotReady | ParticipantReady | ParticipantReconnecting | RoomDismissed;

function ChatRoom(props: {
  room: Room;
  user: User;
}) {
  const {debug} = useDebug();
  const [globalMessage, setGlobalMessage] = useState<MessageSnackbarProps>();
  const [participantState, setParticipantState] = useState<ParticipantState>({
    loading: true,
    ready: false,
    reconnecting: false,
    dismissed: false,
    participant: null,
  });
  const {
    counter: retries,
    increment: incrementRetries,
    reset: resetRetries,
  } = useIncrementer();

  const handleParticipantCreated = (participant: Participant) => {
    resetRetries();
    setParticipantState({
      loading: false,
      ready: false,
      reconnecting: false,
      dismissed: false,
      participant: participant,
    });
  };
  const handleParticipantReady = (participant: Participant) => {
    resetRetries();
    setParticipantState({
      loading: false,
      ready: true,
      reconnecting: false,
      dismissed: false,
      participant: participant,
    });
  };
  const handleRoomDismissed = (participant: Participant) => {
    setParticipantState({
      loading: false,
      ready: true,
      reconnecting: false,
      dismissed: true,
      participant: null,
    });
  };
  const reconnect = (participant: Participant) => {
    if (participantState.dismissed) {
      return;
    }
    incrementRetries();
    setParticipantState((prev) => {
      if (prev.dismissed) {
        return prev;
      }
      return {
        loading: prev.loading,
        ready: prev.ready,
        reconnecting: true,
        dismissed: false,
        participant: participant,
      }
    });
    setTimeout(() => {
      participantState.participant?.reconnect();
    }, retries * 1000);
  };

  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const appendMessage = (newMessage: ChatMessage) => {
    setMessages(history => [
      ...history,
      newMessage,
    ]);
  };

  const [members, setMembers] = useState<Array<User>>([props.user]);
  const getMemberName = (userId: string) => {
    const memberFound = members.find(user => user.userId === userId);
    return memberFound?.nickname ?? userId;
  };

  // hooks for video call
  const [localMediaStream, setLocalMediaStream] = useState<MediaStream>();
  const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream>();
  const [callingWhom, setCallingWhom] = useState<{
    callerUserId: string;
    onCancel: () => void;
  }>();
  const [calledByWhom, setCalledByWhom] = useState<{
    callerUserId: string;
    onAccept: () => void;
    onReject: () => void;
  }>();
  const [videoMuted, setVideoMuted] = useState<boolean>(false);
  const endVideoCall = () => {
    localMediaStream?.getTracks().forEach(track => track.stop());
    setLocalMediaStream(undefined);
    remoteMediaStream?.getTracks().forEach(track => track.stop());
    setRemoteMediaStream(undefined);
    setCallingWhom(undefined);
    setCalledByWhom(undefined);
  };
  const handleVideoCall = () => {
    if (!participantState.participant) {
      return;
    }
    const participant = participantState.participant;
    if (localMediaStream || remoteMediaStream) {
      return;
    }
    const otherMembers = members.filter(user => user.userId !== props.user.userId);
    if (otherMembers.length === 0) {
      return;
    }
    if (otherMembers.length > 1) {
      return;
    }
    const anotherMember = otherMembers[0]!;
    (async () => {
      const localUserMedia = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalMediaStream(localUserMedia);

      setCallingWhom({
        callerUserId: props.user.userId,
        onCancel: () => {
          endVideoCall();
        },
      });
      const remoteUserMedia = await participant.call(localUserMedia, () => {
        endVideoCall();
      });
      setRemoteMediaStream(remoteUserMedia);
      setCallingWhom(undefined);
    })().catch(e => {
      setGlobalMessage(prev => ({
        message: `Failed to call ${anotherMember.nickname ?? anotherMember.userId}`,
        severity: 'error',
        revision: (prev?.revision ?? 0) + 1,
      }));
      console.log(e);
      endVideoCall();
    });;
  };
  const handleBeingCalled = (call: MediaConnection): void => {
    if (localMediaStream || remoteMediaStream) {
      return;
    }

    setCalledByWhom({
      callerUserId: call.peer,
      onAccept: () => {
        setCalledByWhom(undefined);
        (async () => {
          const localUserMedia = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          setLocalMediaStream(localUserMedia);
  
          const promiseReturned = new Promise<void>((resolve, reject) => {
            call.on('stream', remoteUserMedia => {
              setRemoteMediaStream(remoteUserMedia);
              resolve();
            });
            call.on('close', () => {
              endVideoCall();
            });
            // TODO setTimeout reject
            call.on('error', e => {
              reject(e);
            });
          });
          call.answer(localUserMedia);
          return promiseReturned;
        })().catch(e => {
          setGlobalMessage(prev => ({
            message: 'Failed to anwer the call',
            severity: 'error',
            revision: (prev?.revision ?? 0) + 1,
          }));
          console.log(e);
          endVideoCall();
        });
      },
      onReject: () => {
        call.close();
        endVideoCall();
      },
    })
  };

  useBeforeUnload(e => {
    e.returnValue = 'Conversation will be closed permanently. Are you sure?';
  });
  useUnload(() => {
    participantState.participant?.destory();
  });
  const navigate = useNavigate();
  const handleLeave = () => {
    participantState.participant?.destory();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    if (participantState.dismissed || !participantState.loading || participantState.ready || participantState.participant) {
      return;
    }
    let hostOrGuest: Participant;
    if (props.room.roomId === props.user.userId) {
      FireGTagEvents.host({serverName: props.room.serverName});
      const host = new Host({
        room: props.room,
        user: props.user,
        debug,
      });
      hostOrGuest = host;
    } else {
      FireGTagEvents.join({serverName: props.room.serverName});
      hostOrGuest = new Guest({
        room: props.room,
        user: props.user,
        debug,
      });
    }
    hostOrGuest.on('ready', () => handleParticipantReady(hostOrGuest));
    hostOrGuest.on('dismissed', () => {
      handleRoomDismissed(hostOrGuest);
    });
    hostOrGuest.on('disconnected', () => {
      reconnect(hostOrGuest);
    });

    hostOrGuest.on('text', appendMessage);
    hostOrGuest.on('picture', appendMessage);
    hostOrGuest.on('file', appendMessage);
    hostOrGuest.on('joined', appendMessage);
    hostOrGuest.on('left', appendMessage);
    hostOrGuest.on('members', message => {
      setMembers(message.members);
    });
    hostOrGuest.on('called', handleBeingCalled);
    handleParticipantCreated(hostOrGuest);
  }, [
    debug,
    props.room.roomId,
    props.room.serverName,
    props.user.userId,
    participantState.loading,
    participantState.ready,
    participantState.dismissed,
    participantState.participant,
  ]);

  useEffect(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  if (participantState.loading || !participantState.ready) {
    const loadingMessage = ((): React.ReactNode => {
      if (participantState.loading && !participantState.ready) {
        if (retries >= 3) {
          return (
            <>
              {localizeFn('serverConnectionFailureAfterRetry')(retries)}
              <br/>
              {'('}<Link href="#" underline="none" onClick={() => {window.location.reload()}}>{localize('refreshPage')}</Link>{')'}
            </>
          );
        }
        return localizeFn('serverConnectingAfterRetries')(retries, participantState.reconnecting);
      }
      if (!participantState.ready) {
        if (retries >= 1) {
          return (
            <>
              {localizeFn('hostConnectionFailureAfterRetry')(retries)}
              <br/>
              {localize('hostMayHaveLeft')}
              <br/>
              {'('}<Link href="#" underline="none" onClick={() => {window.location.reload()}}>{localize('refreshPage')}</Link>{')'}
            </>
          );
        }
        return localizeFn('hostConnectingAfterRetries')(retries, participantState.reconnecting);
      }
      // unknown
    })();
    return <LoadingProgress message={loadingMessage}/>;
  }

  return (
    <>
      <Grid container spacing={2} sx={{
        position: 'fixed',
        height: '100%',
        overflow: 'scroll',
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
          <Sidebar members={members} onLeave={handleLeave}/>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item md={3} sm={0} xs={0}/>
        <Grid item md={9} sm={12} xs={12}>
          <MessagePane participant={participantState.participant ?? undefined} members={members} messages={messages} dismissed={participantState.dismissed}/>
        </Grid>
      </Grid>
      <Grid container spacing={2} style={{ position: 'fixed', bottom: 0 }}>
        <Grid item md={3} sm={0} xs={0}/>
        <Grid item md={9} sm={12} xs={12}>
          <MessageTextbox
            participant={participantState.participant ?? undefined}
            disabled={participantState.dismissed}
            videoCallDisabled={Boolean(localMediaStream || remoteMediaStream || callingWhom || calledByWhom || members.length !== 2)}
            onVideoCall={handleVideoCall}
          />
        </Grid>
      </Grid>
      {
        (localMediaStream) &&
          <VideoConference
            local={localMediaStream}
            remote={remoteMediaStream}
            onCallEnded={endVideoCall}
            muted={videoMuted}
            onMute={() => setVideoMuted(true)}
            onUnmute={() => setVideoMuted(false)}
          />
      }
      { callingWhom && <CallingSnackbar callingWhom={getMemberName(callingWhom.callerUserId)} onCancel={callingWhom.onCancel}/> }
      { calledByWhom && <BeingCalledSnackbar calledByWhom={getMemberName(calledByWhom.callerUserId)} onAnswer={calledByWhom.onAccept} onCancel={calledByWhom.onReject}/> }
      { globalMessage && <MessageSnackbar {...globalMessage} /> }
    </>
  );
}

export default ChatRoom;
