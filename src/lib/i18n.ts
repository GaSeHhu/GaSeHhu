import { getQueryParam } from "./common";

export enum Locale {
  EN = 'en',
  EN_US = 'en-US',
  ZH = 'zh',
  ZH_CN = 'zh-CN',
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

export type StringId =
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
  | 'sharedTheLink'
  | 'copied'
  | 'messageBoxPlaceholder'
  | 'advancedOptions'
  | 'server'
  | 'poweredBy'
  | 'noMessages'
  | 'home'
  | 'issues'
;

type StringProducer = () => string;

const localization: {[key in StringId]: {[key in Locale]: string | StringProducer}} = {
  '.': {
    'en': () => localization['.']['en-US'] as string,
    'en-US': '.',
    'zh': () => localization['.']['zh-CN'] as string,
    'zh-CN': '。',
  },
  gasehhu: {
    'en': () => localization.gasehhu['en-US'] as string,
    'en-US': 'Ga-Se-Hhu',
    'zh': () => localization.gasehhu['zh-CN'] as string,
    'zh-CN': '茄山河',
  },
  host: {
    'en': () => localization.host['en-US'] as string,
    'en-US': 'host',
    'zh': () => localization.host['zh-CN'] as string,
    'zh-CN': '创建',
  },
  hostARoom: {
    'en': () => localization.hostARoom['en-US'] as string,
    'en-US': 'Host a Room',
    'zh': () => localization.hostARoom['zh-CN'] as string,
    'zh-CN': '创建房间',
  },
  join: {
    'en': () => localization.join['en-US'] as string,
    'en-US': 'join',
    'zh': () => localization.join['zh-CN'] as string,
    'zh-CN': '加入',
  },
  joinARoom: {
    'en': () => localization.joinARoom['en-US'] as string,
    'en-US': 'Join a Room',
    'zh': () => localization.joinARoom['zh-CN'] as string,
    'zh-CN': '加入房间',
  },
  regenerateAvatar: {
    'en': () => localization.regenerateAvatar['en-US'] as string,
    'en-US': 'regenerate avatar',
    'zh': () => localization.regenerateAvatar['zh-CN'] as string,
    'zh-CN': '重新生成头像',
  },
  roomId: {
    'en': () => localization.roomId['en-US'] as string,
    'en-US': 'Room ID',
    'zh': () => localization.roomId['zh-CN'] as string,
    'zh-CN': '房间号',
  },
  room: {
    'en': () => localization.room['en-US'] as string,
    'en-US': 'Room',
    'zh': () => localization.room['zh-CN'] as string,
    'zh-CN': '房间',
  },
  members: {
    'en': () => localization.members['en-US'] as string,
    'en-US': 'Members',
    'zh': () => localization.members['zh-CN'] as string,
    'zh-CN': '成员',
  },
  yourNickname: {
    'en': () => localization.yourNickname['en-US'] as string,
    'en-US': 'Your Nickname',
    'zh': () => localization.yourNickname['zh-CN'] as string,
    'zh-CN': '你的昵称',
  },
  joined: {
    'en': () => localization.joined['en-US'] as string,
    'en-US': 'joined',
    'zh': () => localization.joined['zh-CN'] as string,
    'zh-CN': '加入了',
  },
  left: {
    'en': () => localization.left['en-US'] as string,
    'en-US': 'left',
    'zh': () => localization.left['zh-CN'] as string,
    'zh-CN': '离开了',
  },
  sharedTheLink: {
    'en': () => localization.sharedTheLink['en-US'] as string,
    'en-US': 'Share the Link',
    'zh': () => localization.sharedTheLink['zh-CN'] as string,
    'zh-CN': '分享链接',
  },
  copied: {
    'en': () => localization.copied['en-US'] as string,
    'en-US': 'copied',
    'zh': () => localization.copied['zh-CN'] as string,
    'zh-CN': '复制成功',
  },
  messageBoxPlaceholder: {
    'en': () => localization.messageBoxPlaceholder['en-US'] as string,
    'en-US': 'Type something',
    'zh': () => localization.messageBoxPlaceholder['zh-CN'] as string,
    'zh-CN': '请输入...',
  },
  advancedOptions: {
    'en': () => localization.advancedOptions['en-US'] as string,
    'en-US': 'Advanced Options',
    'zh': () => localization.advancedOptions['zh-CN'] as string,
    'zh-CN': '高级选项',
  },
  server: {
    'en': () => localization.server['en-US'] as string,
    'en-US': 'Server',
    'zh': () => localization.server['zh-CN'] as string,
    'zh-CN': '服务器',
  },
  poweredBy: {
    'en': () => localization.poweredBy['en-US'] as string,
    'en-US': 'powered by',
    'zh': () => localization.poweredBy['zh-CN'] as string,
    'zh-CN': '使用',
  },
  noMessages: {
    'en': () => localization.noMessages['en-US'] as string,
    'en-US': 'No Messages',
    'zh': () => localization.noMessages['zh-CN'] as string,
    'zh-CN': '没有消息',
  },
  home: {
    'en': () => localization.home['en-US'] as string,
    'en-US': 'Home',
    'zh': () => localization.home['zh-CN'] as string,
    'zh-CN': '主页',
  },
  issues: {
    'en': () => localization.issues['en-US'] as string,
    'en-US': 'Issues',
    'zh': () => localization.issues['zh-CN'] as string,
    'zh-CN': '问题',
  },
};

export function localize(stringId: StringId, locale?: Locale): string {
  const localeChosen = locale ?? getLocale(getQueryParam('lang') ?? navigator.language) ?? Locale.EN;
  const localized = localization[stringId][localeChosen];
  if (typeof localized === 'string') {
    return localized;
  }
  return localized();
};
