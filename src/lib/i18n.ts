import { getQueryParam } from "./common";

export enum Locale {
  EN = 'en',
  ZH = 'zh',
}

const getLocale = (lang: string): Locale | null => {
  const locales = (Object as any).values(Locale);
  if (locales.includes(lang)) {
    return lang as Locale;
  }
  const langWithoutCountry = lang.split('-')[0];
  if (locales.includes(langWithoutCountry)) {
    return langWithoutCountry as Locale;
  }
  return null;
}

type SimpleStringId =
  | '.'
  | 'gasehhu'
  | 'host'
  | 'hostARoom'
  | 'join'
  | 'joinARoom'
  | 'regenerateAvatar'
  | 'yourNickname'
  | 'roomId'
  | 'room'
  | 'members'
  | 'joined'
  | 'left'
  | 'leave'
  | 'sharedTheLink'
  | 'copied'
  | 'messageBoxPlaceholder'
  | 'advancedOptions'
  | 'server'
  | 'poweredBy'
  | 'noMessages'
  | 'home'
  | 'issues'
  | 'roomDismissed'
  | 'hostMayHaveLeft'
  | 'refreshPage'
;

type ComplexStringIdTypes = {
  serverConnectionFailureAfterRetry: (retries: number) => string;
  hostConnectionFailureAfterRetry: (retries: number) => string;
  serverConnectingAfterRetries: (retries: number, reconnecting: boolean) => string;
  hostConnectingAfterRetries: (retries: number, reconnecting: boolean) => string;
}

type ComplexStringId = keyof ComplexStringIdTypes;

export type StringId = SimpleStringId | ComplexStringId;

type SimpleStringMappings = {[key in SimpleStringId]: {[key in Locale]: string}};
type ComplexStringMappings = {[id in ComplexStringId]: {[l in Locale]: ComplexStringIdTypes[id]}};
type AllStringMappings = SimpleStringMappings & ComplexStringMappings;

const localizedStrings: AllStringMappings = {
  '.': {
    'en': '.',
    'zh': '。',
  },
  gasehhu: {
    'en': 'Ga-Se-Hhu',
    'zh': '茄山河',
  },
  host: {
    'en': 'host',
    'zh': '创建',
  },
  hostARoom: {
    'en': 'Host a Room',
    'zh': '创建房间',
  },
  join: {
    'en': 'join',
    'zh': '加入',
  },
  joinARoom: {
    'en': 'Join a Room',
    'zh': '加入房间',
  },
  regenerateAvatar: {
    'en': 'regenerate avatar',
    'zh': '重新生成头像',
  },
  roomId: {
    'en': 'Room ID',
    'zh': '房间号',
  },
  room: {
    'en': 'Room',
    'zh': '房间',
  },
  members: {
    'en': 'Members',
    'zh': '成员',
  },
  yourNickname: {
    'en': 'Your Nickname',
    'zh': '你的昵称',
  },
  joined: {
    'en': 'joined',
    'zh': '加入了',
  },
  left: {
    'en': 'left',
    'zh': '离开了',
  },
  leave: {
    'en': 'Leave',
    'zh': '离开',
  },
  roomDismissed: {
    'en': 'The room has been dismissed by the host',
    'zh': '房间已被房主关闭',
  },
  sharedTheLink: {
    'en': 'Share the Link',
    'zh': '分享链接',
  },
  copied: {
    'en': 'copied',
    'zh': '复制成功',
  },
  messageBoxPlaceholder: {
    'en': 'Type something',
    'zh': '请输入...',
  },
  advancedOptions: {
    'en': 'Advanced Options',
    'zh': '高级选项',
  },
  server: {
    'en': 'Server',
    'zh': '服务器',
  },
  poweredBy: {
    'en': 'powered by',
    'zh': '使用',
  },
  noMessages: {
    'en': 'No Messages',
    'zh': '没有消息',
  },
  home: {
    'en': 'Home',
    'zh': '主页',
  },
  issues: {
    'en': 'Issues',
    'zh': '问题',
  },
  serverConnectionFailureAfterRetry: {
    'en': (retries) => `Failed to connect to the server after ${retries} retries.`,
    'zh': (retries) => `连接服务器失败（第${retries}次重试）`,
  },
  hostConnectionFailureAfterRetry: {
    'en': (retries) => `Failed to connect to the host after ${retries} retries.`,
    'zh': (retries) => `连接房间失败（第${retries}次重试）`,
  },
  hostMayHaveLeft: {
    'en': 'The host may have left',
    'zh': '房间可能已经关闭'
  },
  serverConnectingAfterRetries: {
    'en': (retries, reconnecting) => `${reconnecting ? 'Reconnecting' : 'Connecting'} to the server${retries <= 1 ? '' : ` (retried ${retries} times)`}`,
    'zh': (retries, reconnecting) => `正在${reconnecting ? '重新' : ''}连接服务器${retries <= 1 ? '' : `（第${retries} 次重试）`}`,
  },
  hostConnectingAfterRetries: {
    'en': (retries, reconnecting) => `${reconnecting ? 'Reconnecting' : 'Connecting'} to the server${retries <= 1 ? '' : ` (retried ${retries} times)`}`,
    'zh': (retries, reconnecting) => `正在${reconnecting ? '重新' : ''}连接房间${retries <= 1 ? '' : `（第${retries} 次重试）`}`,
  },
  refreshPage: {
    'en': 'refresh the page',
    'zh': '刷新页面',
  },
};

export function getPreferredLocale(): Locale {
  return getLocale(getQueryParam('lang') ?? navigator.language) ?? Locale.EN;
}

export function localize(stringId: SimpleStringId, locale?: Locale): string {
  const localeChosen = locale ?? getPreferredLocale();
  return localizedStrings[stringId][localeChosen];
};

export function localizeFn<T extends ComplexStringId>(stringId: T, locale?: Locale): ComplexStringIdTypes[T] {
  const localeChosen = locale ?? getPreferredLocale();
  return localizedStrings[stringId][localeChosen] as ComplexStringIdTypes[T];
}
