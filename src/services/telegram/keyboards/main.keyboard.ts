import { Markup } from 'telegraf';
import {
  CALLBACK_MENU,
  CALLBACK_PING,
  CALLBACK_ECHO,
  REPLY_BTN_ECHO,
  REPLY_BTN_HELP,
  REPLY_BTN_HIDE,
  REPLY_BTN_LIST,
  REPLY_BTN_BALANCE,
  REPLY_BTN_ORDERS,
  REPLY_BTN_REF,
  REPLY_BTN_SUPPORT,
  REPLY_BTN_BACK,
  REPLY_BTN_AGENT,
  REPLY_BTN_ADMIN_MAIN,
} from '../constants';

export function welcomeKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Меню', CALLBACK_MENU)],
  ]);
}

export function mainMenuKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Ping', CALLBACK_PING)],
    [Markup.button.callback('Echo', CALLBACK_ECHO)],
  ]);
}

export function supportKeyboard() {
  return Markup.keyboard([
    [REPLY_BTN_AGENT],
    [REPLY_BTN_BACK],
  ]).resize();
}

export function refReplyKeyboard() {
  return Markup.keyboard([
    [REPLY_BTN_BACK],
  ]).resize();
}

export function mainReplyKeyboard(isAdmin: boolean = false) {
  if (!isAdmin) {
    return Markup.keyboard([
      [REPLY_BTN_LIST, REPLY_BTN_BALANCE],
      [REPLY_BTN_ORDERS, REPLY_BTN_REF],
      [REPLY_BTN_SUPPORT],
    ]).resize();
  }
  return Markup.keyboard([
    [REPLY_BTN_LIST, REPLY_BTN_BALANCE],
    [REPLY_BTN_ORDERS, REPLY_BTN_REF],
    [REPLY_BTN_ADMIN_MAIN],
    [REPLY_BTN_SUPPORT],
  ]).resize();
}

export function removeReplyKeyboard() {
  return Markup.removeKeyboard();
}
