import { Markup } from 'telegraf';
import {
  CALLBACK_ECHO,
  CALLBACK_MENU,
  CALLBACK_PING,
  REPLY_BTN_ECHO,
  REPLY_BTN_HELP,
  REPLY_BTN_HIDE,
  REPLY_BTN_LIST,
  REPLY_BTN_PING,
  REPLY_BTN_BALANCE,
  REPLY_BTN_ORDERS,
  REPLY_BTN_REF,
  REPLY_BTN_SUPPORT,
  REPLY_BTN_BACK,
  REPLY_BTN_AGENT,
  REPLY_BTN_ADMIN_MAIN,
  REPLY_ADMIN_BROADCAST,
  REPLY_ADMIN_FIND_USER,
  REPLY_ADMIN_REMOVE_BALANCE,
  REPLY_ADMIN_ADD_BALANCE,
  REPLY_ADMIN_PIN_PRODUCT,
  REPLY_ADMIN_EDIT_ITEM,
  REPLY_ADMIN_REMOVE_ITEM,
  REPLY_ADMIN_ADD_ITEM
} from './constants';

/** Inline: кнопки под сообщением (callback) */
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

/** Reply: клавиатура под полем ввода чата (не callback — шлёт текст) */
export function mainReplyKeyboard(isAdmin: boolean = false) {
  if (isAdmin === false) {
  return Markup.keyboard([
    [REPLY_BTN_LIST, REPLY_BTN_BALANCE],
    [REPLY_BTN_ORDERS, REPLY_BTN_REF],
    [REPLY_BTN_SUPPORT],
  ]).resize();
}else{
  return Markup.keyboard([
    [REPLY_BTN_LIST, REPLY_BTN_BALANCE],
    [REPLY_BTN_ORDERS, REPLY_BTN_REF],
    [REPLY_BTN_SUPPORT],
    [REPLY_BTN_ADMIN_MAIN],
  ]).resize();
}
}

export function adminMainKeyboard() {
  return Markup.keyboard([
    [REPLY_ADMIN_ADD_ITEM, REPLY_ADMIN_REMOVE_ITEM],
    [REPLY_ADMIN_EDIT_ITEM, REPLY_ADMIN_PIN_PRODUCT],
    [REPLY_ADMIN_ADD_BALANCE, REPLY_ADMIN_REMOVE_BALANCE],
    [REPLY_ADMIN_FIND_USER],
    [REPLY_ADMIN_BROADCAST],
    [REPLY_BTN_BACK],
  ]).resize();
}

export function removeReplyKeyboard() {
  return Markup.removeKeyboard();
}
