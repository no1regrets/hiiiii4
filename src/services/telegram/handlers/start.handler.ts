import { Start, Ctx, Update } from 'nestjs-telegraf';
import { TelegramUserService } from '../service/telegram-user.service';
import { mainReplyKeyboard } from '../keyboards';
import type { BotContext } from '../telegram.update';

@Update()
export class StartHandler {
  constructor(private readonly userService: TelegramUserService) {}

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    const from = ctx.from;
    if (!from) {
      await ctx.reply('Ошибка: не удалось получить информацию о пользователе. Пожалуйста, попробуйте снова.');
      return;
    }
    // @ts-ignore
    const refcode = ctx.message ? Number(ctx.message.text?.split(' ')[1]) : undefined;
    const user = await this.userService.createOrUpdateUser({
      telegramId: from.id,
      username: from.username,
      firstName: from.first_name,
      refId: refcode,
    });

    ctx.session = { isAdmin: user.isAdmin ?? false };
    await ctx.reply(
      '🤖 Главное меню\n\nВыберите действие:',
      mainReplyKeyboard(ctx.session!.isAdmin),
    );
  }
}
