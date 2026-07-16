import { Markup } from 'telegraf';
import {
  REPLY_ADMIN_ADD_ITEM,
  REPLY_ADMIN_REMOVE_ITEM,
  REPLY_ADMIN_EDIT_ITEM,
  REPLY_ADMIN_PIN_PRODUCT,
  REPLY_ADMIN_ADD_BALANCE,
  REPLY_ADMIN_REMOVE_BALANCE,
  REPLY_ADMIN_FIND_USER,
  REPLY_ADMIN_BROADCAST,
  REPLY_BTN_BACK,
  CALLBACK_ADMIN_PUBLISH_ITEM,
  CALLBACK_ADMIN_BACK,
  CALLBACK_ADMIN_SKIP,
} from '../constants';

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

export function adminBackCallback() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
  ]);
}

export function addItemKeyboard(isConfirmed: boolean = false) {
  if (isConfirmed) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Опубликовать товар', CALLBACK_ADMIN_PUBLISH_ITEM)],
      [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
    ]);
  }
  return Markup.inlineKeyboard([
    [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
  ]);
}
