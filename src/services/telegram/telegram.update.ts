import { Update, Help, Hears, Ctx } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { mainReplyKeyboard, supportKeyboard } from './keyboards';
import {
  REPLY_BTN_BACK,
  REPLY_BTN_SUPPORT,
} from './constants';

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

type SessionData = {
  isAdmin?: boolean;
  scene?: 'addProduct' | 'default';
  addProductStep?: 'name' | 'description' | 'price' | 'data';
  lastmessageid?: number;
  currentCataloguePage?: number;
  currentPagesCount?: number;
  currentProductId?: string;
  productDraft?: {
    name?: string;
    description?: string;
    price?: number;
    data?: string;
  }
};

export type BotContext = Context & { session?: SessionData };

@Update()
export class TelegramUpdate {
  @Help()
  async onHelp(@Ctx() ctx: BotContext) {
    await ctx.reply([
      'Доступные команды:',
      '/start — приветствие и кнопка «Меню»',
      '/help — эта справка',
      '',
      'Inline: «Меню» → Ping / Echo.',
      'Reply-клавиатура: те же Ping и Echo текстом снизу.',
    ].join('\n'));
  }

  @Hears(REPLY_BTN_BACK)
  async onReplyBack(@Ctx() ctx: BotContext) {
    await ctx.reply('🤖 Главное меню\n\nВыберите действие:', mainReplyKeyboard(ctx.session!.isAdmin));
  }

  @Hears(REPLY_BTN_SUPPORT)
  async onReplySupport(@Ctx() ctx: BotContext) {
    await ctx.reply(
      '🛠 Поддержка\n\nЕсли вам нужна помощь с заказом, пополнением баланса или другой проблемой, напишите агенту поддержки!\n\nЧасы работы: 9:00-21:00 (по московскому времени)',
      supportKeyboard(),
    );
  }
}
