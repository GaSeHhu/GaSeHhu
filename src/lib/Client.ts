import { EventEmitter } from "eventemitter3";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import { DefaultPeerJsServer, PeerJsKnownServers } from "./consts";
import { encodeBlobToDataUrl } from "./FileSerde";
import { User } from "./User";

export type MessageType =
  | 'Hello'
  | 'Text'
  | 'Picture'
  | 'File'
  | 'MembersChanged'
  | 'MemberJoined'
  | 'MemberLeft'
;

export interface TypedMessage {
  type: MessageType;
}

export interface HelloMessage extends TypedMessage {
  type: 'Hello';
  myNameIs?: string;
}

export interface DelegatedMessage extends TypedMessage {
  onBehalfOf: string;
}

export interface TimestampedMessage {
  timestamp: number;
}

export interface TextMessage extends DelegatedMessage, TimestampedMessage {
  type: 'Text';
  text: string;
}

export interface PictureMessage extends DelegatedMessage, TimestampedMessage {
  type: 'Picture';
  src: string;
}

export interface FileAttachmentMessage extends DelegatedMessage, TimestampedMessage {
  type: 'File';
  filename: string;
  src: string;
}

export interface MembersChangedMessage extends TypedMessage {
  type: 'MembersChanged';
  members: Array<User>;
}

export interface MemberJoinedMessage extends TypedMessage {
  type: 'MemberJoined';
  member: User;
}

export interface MemberLeftMessage extends TypedMessage {
  type: 'MemberLeft';
  member: User;
}

export type ChatMessage =
  | HelloMessage
  | TextMessage
  | PictureMessage
  | FileAttachmentMessage
  | MembersChangedMessage
  | MemberJoinedMessage
  | MemberLeftMessage
;

export type TextMessageListener = (text: TextMessage) => void;
export type ParticipantReadyListener = () => void;

type ParticipantEvents = {
  ready: () => void;
  text: (text: TextMessage) => void;
  picture: (picture: PictureMessage) => void;
  file: (file: FileAttachmentMessage) => void;
  members: (members: MembersChangedMessage) => void;
  joined: (joined: MemberJoinedMessage) => void;
  left: (left: MemberLeftMessage) => void;
  called: (mediaConnection: MediaConnection) => void;
  dismissed: () => void;
  disconnected: () => void;
};

export interface Room {
  roomId: string;
  serverName?: string;
}

const getPeerJsServerOptions = (room: Room) => {
  const serverName = room.serverName;
  if (!serverName) {
    return DefaultPeerJsServer;
  }
  return PeerJsKnownServers[serverName] ?? DefaultPeerJsServer;
}

export interface ParticipantOptions {
  room: Room;
  user: User;
  debug?: boolean;
}

export abstract class Participant extends EventEmitter<ParticipantEvents> {

  user: User;
  options: ParticipantOptions;

  abstract sendText(text: string): void;

  abstract sendPicture(picture: Blob): void;

  abstract sendFile(file: File): void;

  abstract call(mediaStream: MediaStream, onClose?: (() => void)): Promise<MediaStream>;

  abstract reconnect(): void;

  abstract destory(): void;

  constructor(options: ParticipantOptions) {
    super();
    this.user = options.user;
    this.options = options;
  }
}

const RetriableErrorTypes = new Set([
  'disconnected',
  'network',
  'peer-unavailable',
  'webrtc',
]);

export class Host extends Participant {
  peer: Peer;
  guests: {[key: string]: DataConnection} = {};
  othersNames: {[key: string]: string} = {};

  constructor(options: ParticipantOptions) {
    super(options);
    this.peer = new Peer(options.user.userId, {
      debug: options.debug ? 3 : undefined,
      ...getPeerJsServerOptions(options.room),
    });
    this.peer.on('open', () => {
      this.emit('ready');
    });
    this.peer.on('connection', (guestConnection) => {
      const guestUserId = guestConnection.peer;
      this.guests[guestUserId] = guestConnection;
      guestConnection.on('data', (data) => {
        const msgObj = data as any;
        if (!msgObj || !msgObj.type) {
          return;
        }
        switch (msgObj.type) {
          case 'Hello':
            if (!msgObj.myNameIs) {
              return;
            }
            this.othersNames[guestUserId] = msgObj.myNameIs;

            const memberJoined: MemberJoinedMessage = {
              type: 'MemberJoined',
              member: {
                userId: guestUserId,
                nickname: msgObj.myNameIs,
              },
            };
            this.broadcast(memberJoined, guestUserId);
            this.emit('joined', memberJoined);

            const newMembers = this.getMembers();
            const membersChanged: MembersChangedMessage = {
              type: 'MembersChanged',
              members: newMembers,
            };
            this.broadcast(membersChanged);
            this.emit('members', membersChanged);
            break;
          case 'Text':
            if (!msgObj.onBehalfOf || !msgObj.text || !msgObj.timestamp) {
              return;
            }
            const textMessageReceived: TextMessage = {
              type: 'Text',
              onBehalfOf: guestUserId,
              timestamp: msgObj.timestamp,
              text: msgObj.text,
            }
            this.broadcast(textMessageReceived, guestUserId);
            this.emit('text', textMessageReceived);
            break;
          case 'Picture':
            if (!msgObj.onBehalfOf || !msgObj.timestamp || !msgObj.src) {
              return;
            }
            const pictureReceived: PictureMessage = {
              type: 'Picture',
              onBehalfOf: guestUserId,
              timestamp: msgObj.timestamp,
              src: msgObj.src,
            }
            this.broadcast(pictureReceived, guestUserId);
            this.emit('picture', pictureReceived);
            break;
          case 'File':
            if (!msgObj.onBehalfOf || !msgObj.filename || !msgObj.timestamp || !msgObj.src) {
              return;
            }
            const fileReceived: FileAttachmentMessage = {
              type: 'File',
              onBehalfOf: guestUserId,
              timestamp: msgObj.timestamp,
              src: msgObj.src,
              filename: msgObj.filename,
            }
            this.broadcast(fileReceived, guestUserId);
            this.emit('file', fileReceived);
            break;
        }
      });
      guestConnection.on('close', () => {
        delete this.guests[guestUserId];

        const memberLeft: MemberLeftMessage = {
          type: 'MemberLeft',
          member: {
            userId: guestUserId,
            nickname: this.othersNames[guestUserId],
          },
        };
        this.broadcast(memberLeft, guestUserId);
        this.emit('left', memberLeft);

        const newMembers = this.getMembers();
        const membersChanged: MembersChangedMessage = {
          type: 'MembersChanged',
          members: newMembers,
        };
        this.broadcast(membersChanged);
        this.emit('members', membersChanged);
      });
      const greetings: HelloMessage = {
        type: 'Hello',
        myNameIs: options.user.nickname,
      };
      guestConnection.send(greetings);
    });
    this.peer.on('call', conn => {
      this.emit('called', conn);
    });
    this.peer.on('disconnected', () => {
      this.emit('disconnected');
    });
  }

  sendText(text: string) {
    const textMessage: TextMessage = {
      type: 'Text',
      onBehalfOf: this.user.userId,
      timestamp: new Date().getTime(),
      text: text,
    };
    this.broadcast(textMessage);
    this.emit('text', textMessage);
  }

  sendPicture(picture: Blob): void {
    encodeBlobToDataUrl(picture).then(dataBase64 => {
      const pictureMessage: PictureMessage = {
        type: 'Picture',
        onBehalfOf: this.user.userId,
        timestamp: new Date().getTime(),
        src: dataBase64,
      };
      this.broadcast(pictureMessage);
      this.emit('picture', pictureMessage);
    });
  }

  sendFile(file: File): void {
    encodeBlobToDataUrl(file).then(dataBase64 => {
      const fileAttachment: FileAttachmentMessage = {
        type: 'File',
        onBehalfOf: this.user.userId,
        timestamp: new Date().getTime(),
        src: dataBase64,
        filename: file.name,
      };
      this.broadcast(fileAttachment);
      this.emit('file', fileAttachment);
    });
  }

  call(mediaStream: MediaStream, onClose?: (() => void)): Promise<MediaStream> {
    const guestPeerIds = Object.keys(this.guests);
    if (guestPeerIds.length === 0) {
      return Promise.reject(new Error('There is no active connection.'));
    }
    if (guestPeerIds.length > 1) {
      return Promise.reject(new Error('unsupported'));
    }
    const guestPeerId = guestPeerIds[0];
    return new Promise((resolve, reject) => {
      this.peer.call(guestPeerId, mediaStream)
        .on('stream', connected => {
          resolve(connected);
        })
        .on('close', () => {
          onClose?.();
        })
        .on('error', error => {
          reject(error);
        });
    });
  }

  reconnect() {
    this.peer.reconnect();
  }

  destory() {
    for (let guest of Object.values(this.guests)) {
      guest.close();
    }
    this.peer.disconnect();
    this.peer.destroy();
  }

  broadcast(message: ChatMessage, exceptUserId?: string): void {
    for (let [peerId, guest] of Object.entries(this.guests)) {
      if (exceptUserId !== peerId) {
        guest.send(message);
      }
    }
  }
  
  getMembers(): Array<User> {
    return [
      {
        userId: this.user.userId,
        nickname: this.user.nickname,
      },
      ...Object.keys(this.guests).map(userId => {
        return {
          userId,
          nickname: this.othersNames[userId],
        };
      })
    ];
  }
}

export class Guest extends Participant {
  peer: Peer;
  hostConnection: DataConnection | undefined;

  constructor(options: ParticipantOptions) {
    super(options);
    this.peer = new Peer(options.user.userId, {
      debug: options.debug ? 3 : undefined,
      ...getPeerJsServerOptions(options.room),
    });
    this.peer.on('open', () => {
      this.establishHostConnection();
    });
    this.peer.on('call', conn => {
      this.emit('called', conn);
    });
    this.peer.on('error', error => {
      const errorType = (error as any).type;
      if ('peer-unavailable' === errorType) {
        // disconnect and retry if necessary
        this.peer.disconnect();
      }
    });
    this.peer.on('disconnected', () => {
      this.emit('disconnected');
      this.hostConnection?.close();
    });
  }

  private establishHostConnection() {
    const hostConnection = this.peer.connect(this.options.room.roomId);
    hostConnection.on('open', () => {
      this.emit('ready');
      const greetings: HelloMessage = {
        type: 'Hello',
        myNameIs: this.options.user.nickname,
      };
      this.hostConnection = hostConnection;
      hostConnection.send(greetings);
    });
    hostConnection.on('data', (data) => {
      const msgObj = data as any;
      if (!msgObj || !msgObj.type) {
        return;
      }
      switch (msgObj.type) {
        case 'Text':
          const textMessageReceived = msgObj as TextMessage;
          this.emit('text', textMessageReceived);
          break;
        case 'Picture':
          const pictureReceived = msgObj as PictureMessage;
          this.emit('picture', pictureReceived);
          break;
        case 'File':
          const fileReceived = msgObj as FileAttachmentMessage;
          this.emit('file', fileReceived);
          break;
        case 'MembersChanged':
          const membersChanged = msgObj as MembersChangedMessage;
          this.emit('members', membersChanged);
          break;
        case 'MemberJoined':
          const memberJoined = msgObj as MemberJoinedMessage;
          this.emit('joined', memberJoined);
          break;
        case 'MembersLeft':
          const memberLeft = msgObj as MemberLeftMessage;
          this.emit('left', memberLeft);
          break;
      }
    });
    hostConnection.on('close', () => {
      this.peer.disconnect();
      this.emit('dismissed');
      this.hostConnection = undefined;
    });
  }

  sendText(text: string) {
    const textMessage: TextMessage = {
      type: 'Text',
      onBehalfOf: this.user.userId,
      timestamp: new Date().getTime(),
      text: text,
    };
    this.emit('text', textMessage);
    this.hostConnection?.send(textMessage);
  }

  sendPicture(picture: Blob): void {
    encodeBlobToDataUrl(picture).then(dataBase64 => {
      const pictureMessage: PictureMessage = {
        type: 'Picture',
        onBehalfOf: this.user.userId,
        timestamp: new Date().getTime(),
        src: dataBase64,
      };
      this.emit('picture', pictureMessage);
      this.hostConnection?.send(pictureMessage);
    });
  }

  sendFile(file: File): void {
    encodeBlobToDataUrl(file).then(dataBase64 => {
      const fileAttachment: FileAttachmentMessage = {
        type: 'File',
        onBehalfOf: this.user.userId,
        timestamp: new Date().getTime(),
        src: dataBase64,
        filename: file.name,
      };
      this.emit('file', fileAttachment);
      this.hostConnection?.send(fileAttachment);
    });
  }

  call(mediaStream: MediaStream, onClose?: (() => void)): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      this.peer.call(this.options.room.roomId, mediaStream)
        .on('stream', connected => {
          resolve(connected);
        })
        .on('close', () => {
          onClose?.();
        })
        .on('error', error => {
          reject(error);
        });
    });
  }

  reconnect() {
    this.peer.reconnect();
  }

  destory() {
    this.peer.disconnect();
    this.peer.destroy();
  }
}
