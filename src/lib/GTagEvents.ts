export interface HostEvent {
  serverName? : string;
}

export interface JoinEvent {
  serverName? : string;
}

const FireGTagEvents = {
  host: (e: HostEvent): void => gtag?.('event', 'host', e),
  join: (e: JoinEvent): void => gtag?.('event', 'join', e),
  share: (): void => gtag?.('event', 'share'),
};
export default FireGTagEvents;
