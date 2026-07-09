import { Markup } from 'telegraf';
import {
  CALLBACK_ECHO,
  CALLBACK_MENU,
  CALLBACK_PING,
  CALLBACK_ADMIN_BACK,
  CALLBACK_ADMIN_SKIP,
  CALLBACK_PRODUCT_1,
  CALLBACK_PRODUCT_2,
  CALLBACK_PRODUCT_3,
  CALLBACK_PRODUCT_4,
  CALLBACK_PREV_LIST,
  CALLBACK_NEXT_LIST,
  CALLBACK_NONE,
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
  REPLY_ADMIN_BROADCAST,
  REPLY_ADMIN_FIND_USER,
  REPLY_ADMIN_REMOVE_BALANCE,
  REPLY_ADMIN_ADD_BALANCE,
  REPLY_ADMIN_PIN_PRODUCT,
  REPLY_ADMIN_EDIT_ITEM,
  REPLY_ADMIN_REMOVE_ITEM,
  REPLY_ADMIN_ADD_ITEM,
  REPLY_ADMIN_BACK,
  REPLY_ADMIN_SKIP,
  CALLBACK_ADMIN_PUBLISH_ITEM,
  CALLBACK_CATALOGUE_BACK,
  CALLBACK_BUY,
  CALLBACK_CONFIRMED_BUY_BUTTON,
} from './constants';
import { from, of } from 'rxjs';
// import type { Products } from 'generated/prisma/models/Products.ts';

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
  console.log("Generating main reply keyboard, isAdmin:", isAdmin);
  if (!isAdmin) {
  return Markup.keyboard([
    [REPLY_BTN_LIST, REPLY_BTN_BALANCE],
    [REPLY_BTN_ORDERS, REPLY_BTN_REF],
    [REPLY_BTN_SUPPORT],
  ]).resize();
}else{
  return Markup.keyboard([
    [REPLY_BTN_LIST, REPLY_BTN_BALANCE],
    [REPLY_BTN_ORDERS, REPLY_BTN_REF],
    [REPLY_BTN_ADMIN_MAIN],
    [REPLY_BTN_SUPPORT],
  ]).resize();
}
}

export type Products = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  productData?: Record<string, any> | null;
  viewsCount: number;
  salesCount: number;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function catalogKeyboard(products: Products[], currentPage: number) {
  const callbacks = [CALLBACK_PRODUCT_1, CALLBACK_PRODUCT_2, CALLBACK_PRODUCT_3, CALLBACK_PRODUCT_4];

  const buttons = products.map((product, index) => [
    Markup.button.callback(`${product.name} - ${product.price}₽`, callbacks[index]),
  ]);

  return Markup.inlineKeyboard([
    ...buttons,
    [
      Markup.button.callback('<<', CALLBACK_PREV_LIST),
      Markup.button.callback(currentPage.toString(), CALLBACK_NONE),
      Markup.button.callback('>>', CALLBACK_NEXT_LIST),
    ],
  ]);
}

export function productKeyboard(){
  return Markup.inlineKeyboard([
    [Markup.button.callback('Приобрести', CALLBACK_BUY)],
    [Markup.button.callback('Назад', CALLBACK_CATALOGUE_BACK)],
  ]);
}

export function notEnoughFundsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Пополнить баланс', REPLY_BTN_BALANCE)],
    [Markup.button.callback('Назад', CALLBACK_CATALOGUE_BACK)],
  ]);
}

export function confirmPurchaseKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Подтвердить', CALLBACK_CONFIRMED_BUY_BUTTON)],
    [Markup.button.callback('Отмена', CALLBACK_CATALOGUE_BACK)],
  ]);
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

export function adminBackCallback() {
  return Markup.inlineKeyboard([
      [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
  ]);
}

export function addItemKeyboard(isReqired: boolean = true, isConfirmed: boolean = false) {
  if (isConfirmed) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('Опубликовать товар', CALLBACK_ADMIN_PUBLISH_ITEM)],
      [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
    ]);
  }
  if(!isReqired){
    return Markup.inlineKeyboard([
      [Markup.button.callback('Пропустить', CALLBACK_ADMIN_SKIP)],
      [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
    ]);
    }
    return Markup.inlineKeyboard([
      [Markup.button.callback('Назад', CALLBACK_ADMIN_BACK)],
    ]);
}

export function removeReplyKeyboard() {
  return Markup.removeKeyboard();
}
