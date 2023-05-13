# Ga-Se-Hhu

![License](https://img.shields.io/github/license/GaSeHhu/GaSeHhu)

**Ga-Se-Hhu** (*Gossip* in Wu-Chinese) is a server*less* P2P chatting application.

Visit [home page](https://gasehhu.github.io/) to host your own chatroom.

## Screenshot

![screenshot](../assets/screenshot-chatroom.png?raw=true)

## Features

- **Serverless**:
  There is no server between two peers once the connection is etablished by a [PeerJS][1] server. No peer-to-peer data goes through the server.

- **Short-lived**:
  The messages are not persisted. Every peer receives and stores the messages in its own memory. A chatroom will be closed once the host leaves.

- **Anonymous**:
  You do not need to register an account.

[1]: https://peerjs.com
