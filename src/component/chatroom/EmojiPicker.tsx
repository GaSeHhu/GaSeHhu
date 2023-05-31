import React from 'react';

import { Popper } from '@mui/material';
import Picker from '@emoji-mart/react';
import emojiData from '@emoji-mart/data';
import enI18n from '@emoji-mart/data/i18n/en.json'
import zhI18n from '@emoji-mart/data/i18n/zh.json'
import { Locale, getPreferredLocale } from '../../lib/i18n';

export interface Emoji {
  id: string;
  name: string;
  keywords: string[];
  native: string;
  shortCodes: string;
  unified: string;
}

export interface EmojiPickerProps {
  open: boolean;
  anchorEl?: HTMLElement;
  onEmojiSelect?: (emoji: Emoji, event: PointerEvent) => void;
  onClickOutside?: () => void;
}

export default function EmojiPicker(props: EmojiPickerProps) {
  const emojiI18n: any = (() => {
    const locale = getPreferredLocale();
    switch (locale) {
      case Locale.EN:
        return enI18n;
      case Locale.ZH:
        return zhI18n;
    }
  })();
  return (
    <Popper open={props.open} anchorEl={props.anchorEl} placement="top-start">
      <Picker data={emojiData} i18n={emojiI18n} onEmojiSelect={props.onEmojiSelect} onClickOutside={props.onClickOutside} />
    </Popper>
  );
}
