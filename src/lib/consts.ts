import { PeerJSOption } from "peerjs";

export const PeerJsKnownServers: {[key in string]: PeerJSOption} = {
  'peerjs': {},
  '92k.de': {
    host: 'peerjs.92k.de',
    secure: true,
  },
  '92k.de-qq': {
    host: 'peerjs.92k.de',
    secure: true,
    config: {
      iceServers: [
        { urls: 'stun:stun.qq.com:3478' },
      ],
    },
  },
  '92k.de-google': {
    host: 'peerjs.92k.de',
    secure: true,
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    },
  },
};

export const DefaultPeerJsServerName = '92k.de';
export const DefaultPeerJsServer = PeerJsKnownServers[DefaultPeerJsServerName];

export const PreferredServerNamesPerCountryCode: {[key in string]: string} = {
  'CN': '92k.de-qq',
  'DE': '92k.de',
  'US': '92k.de-google',
  'CA': '92k.de-google',
};
