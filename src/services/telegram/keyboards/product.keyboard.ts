import { Markup } from 'telegraf';
import {
  CALLBACK_PRODUCT_1,
  CALLBACK_PRODUCT_2,
  CALLBACK_PRODUCT_3,
  CALLBACK_PRODUCT_4,
  CALLBACK_PREV_LIST,
  CALLBACK_NEXT_LIST,
  CALLBACK_NONE,
  CALLBACK_BUY,
  CALLBACK_CATALOGUE_BACK,
  CALLBACK_CONFIRMED_BUY_BUTTON,
  REPLY_BTN_BALANCE,
} from '../constants';

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

export function productKeyboard() {
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
