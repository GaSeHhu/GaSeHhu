import React, { useEffect, useState } from 'react';
import { Grid, Link } from '@mui/material';
import { ChatMessage, Guest, Host, Participant, Room } from '../lib/Client';
import { User } from '../lib/User';
import { useDebug, useBeforeUnload, useUnload, useIncrementer } from '../lib/common';
import FireGTagEvents from '../lib/GTagEvents';
import Sidebar from './chatroom/Sidebar';
import MessageTextbox from './chatroom/MessageTextbox';
import MessagePane from './chatroom/MessagePane';
import LoadingProgress from './LoadingProgress';

interface ParticipantNotCreated {
  loading: true;
  ready: false;
  reconnecting: false;
  participant: null;
}

interface ParticipantNotReady {
  loading: false;
  ready: false;
  reconnecting: false;
  participant: Participant;
}

interface ParticipantReady {
  loading: false;
  ready: true;
  reconnecting: false;
  participant: Participant;
}

interface ParticipantReconnecting {
  loading: boolean;
  ready: boolean;
  reconnecting: true;
  participant: Participant;
}

type ParticipantState = ParticipantNotCreated | ParticipantNotReady | ParticipantReady | ParticipantReconnecting;

function ChatRoom(props: {
  room: Room;
  user: User;
}) {
  const {debug} = useDebug();
  const [participantState, setParticipantState] = useState<ParticipantState>({
    loading: true,
    ready: false,
    reconnecting: false,
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
      participant: participant,
    });
  };
  const handleParticipantReady = (participant: Participant) => {
    resetRetries();
    setParticipantState({
      loading: false,
      ready: true,
      reconnecting: false,
      participant: participant,
    });
  };
  const reconnect = (participant: Participant) => {
    incrementRetries();
    setParticipantState((prev) => ({
      loading: prev.loading,
      ready: prev.ready,
      reconnecting: true,
      participant: participant,
    }));
    setTimeout(() => {
      participant.reconnect();
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

  useBeforeUnload(e => {
    e.returnValue = 'Conversation will be closed permanently. Are you sure?';
  });
  useUnload(() => {
    participantState.participant?.destory();
  });

  useEffect(() => {
    if (!participantState.loading || participantState.ready || participantState.participant) {
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
    hostOrGuest.on('disconnected', () => reconnect(hostOrGuest));

    hostOrGuest.on('text', appendMessage);
    hostOrGuest.on('picture', appendMessage);
    hostOrGuest.on('file', appendMessage);
    hostOrGuest.on('joined', appendMessage);
    hostOrGuest.on('left', appendMessage);
    hostOrGuest.on('members', message => {
      setMembers(message.members);
      appendMessage(message);
    });
    handleParticipantCreated(hostOrGuest);
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
    const loadingMessage = ((): React.ReactNode => {
      // TODO localize
      const connecting = participantState.reconnecting ? 'Reconnecting' : 'Connecting';
      const triedHowManyTimes = retries <= 1 ? '' : ` (retried ${retries} times)`;
      if (participantState.loading && !participantState.ready) {
        if (retries >= 5) {
          return (
            <>
              {`Failed to connect to the server after ${retries} retries.`}
              <br/>
              {'('}<Link href="#" underline="none" onClick={() => {window.location.reload()}}>refresh the page</Link>{')'}
            </>
          );
        }
        return `${connecting} to the server${triedHowManyTimes} ...`;
      }
      if (!participantState.ready) {
        if (retries >= 3) {
          return (
            <>
              {`Failed to connect to the host after ${retries} retries.`}
              <br/>
              {'The host may have left.'}
              <br/>
              {'('}<Link href="#" underline="none" onClick={() => {window.location.reload()}}>refresh the page</Link>{')'}
            </>
          );
        }
        return `${connecting} to the host${triedHowManyTimes} ...`;
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
