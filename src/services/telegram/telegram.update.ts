import {
  Action,
  Ctx,
  Hears,
  Help,
  On,
  Start,
  Update,
} from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CALLBACK_ECHO,
  CALLBACK_MENU,
  CALLBACK_PING,
  REPLY_BTN_ADMIN_MAIN,
  REPLY_BTN_BACK,
  REPLY_BTN_ECHO,
  REPLY_BTN_HELP,
  REPLY_BTN_HIDE,
  REPLY_BTN_PING,
  REPLY_BTN_REF,
  REPLY_BTN_SUPPORT,
} from './constants';
import {
  mainMenuKeyboard,
  mainReplyKeyboard,
  removeReplyKeyboard,
  welcomeKeyboard,
  refReplyKeyboard,
  supportKeyboard,
  adminMainKeyboard
} from './keyboards';
import { TelegramService } from './telegram.service';

type SessionData = {
      is_admin?: boolean;
};

type BotContext = Context & { session?: SessionData };

@Update()
export class TelegramUpdate {
  constructor(private readonly telegramService: TelegramService) { }

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    const from = ctx.from;
    if (!from) { await ctx.reply('Ошибка: не удалось получить информацию о пользователе. Пожалуйста, попробуйте снова.'); return; }
    // @ts-ignore
    const refcode = ctx.message ? Number(ctx.message.text?.split(' ')[1]) : undefined;
    const user = await this.telegramService.createOrUpdateUser({
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      refId: refcode,
    });
    console.log("User after upsert:", { user });

    ctx.session = { is_admin: user.is_admin };
    await ctx.reply(
      '🤖 Главное меню\n\nВыберите действие:',
      mainReplyKeyboard(ctx.session.is_admin),
    ); return;
  }

  @Help()
  async onHelp(@Ctx() ctx: BotContext) {
    await ctx.reply(
      [
        'Доступные команды:',
        '/start — приветствие и кнопка «Меню»',
        '/help — эта справка',
        '',
        'Inline: «Меню» → Ping / Echo.',
        'Reply-клавиатура: те же Ping и Echo текстом снизу.',
      ].join('\n'),
    );
  }

  @Hears(REPLY_BTN_REF)
  async onReplyRef(@Ctx() ctx: BotContext) {
    const refsys = await this.telegramService.getRef(ctx.from?.id ?? 0);

    await ctx.reply(
      '🤝 Реферальная система\n\nПриглашено пользователей: ' + refsys?.User.length + "\nЗаработано: " + refsys?.refEarned + '\n\nВаша реферальная ссылка: https://t.me/lessononeone_bot?start=' + ctx.from?.id,
      refReplyKeyboard(),
    );
  }

  @Hears(REPLY_BTN_BACK)
  async onReplyBack(@Ctx() ctx: BotContext) {
    await ctx.reply('🤖 Главное меню\n\nВыберите действие:', mainReplyKeyboard(ctx.session!.is_admin));
  }

  @Hears(REPLY_BTN_ADMIN_MAIN)
  async onReplyAdminMain(@Ctx() ctx: BotContext) {
    if (!ctx.session?.is_admin) {
      await ctx.reply('У вас нет доступа к админ-панели.');
      return;
    }
    await ctx.reply('⚙️ Админ-панель\n\nВыберите действие:', adminMainKeyboard());
  }

  @Hears(REPLY_BTN_SUPPORT)
  async onReplySupport(@Ctx() ctx: BotContext) {
    await ctx.reply('🛠 Поддержка\n\nЕсли вам нужна помощь с заказом, пополнением баланса или другой проблемой, напишите агенту поддержки!\n\nЧасы работы: 9:00-21:00 (по московскому времени)', supportKeyboard());
  }

  @Hears(REPLY_BTN_HELP)
  async onReplyHelp(@Ctx() ctx: BotContext) {
    await this.onHelp(ctx);
  }

  @Hears(REPLY_BTN_HIDE)
  async onReplyHide(@Ctx() ctx: BotContext) {
    await ctx.reply('Reply-клавиатура скрыта. Снова появится после /start.', removeReplyKeyboard());
  }

  @Action(CALLBACK_MENU)
  async onMenu(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('Выберите действие:', mainMenuKeyboard());
  }

  @Action(CALLBACK_PING)
  async onPing(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('pong');
  }

  @Action(CALLBACK_ECHO)
  async onEcho(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    if (!ctx.session) {
      ctx.session = {};
    }
    await ctx.reply('Введите текст, который нужно повторить:');
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const msg = ctx.message;
    if (!msg || !('text' in msg)) return;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;
    await ctx.reply(text);
  }
}
