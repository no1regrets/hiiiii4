import { Hears, Ctx, Update } from 'nestjs-telegraf';
import { TelegramReferralService } from '../service/telegram-referral.service';
import { REPLY_BTN_REF } from '../constants';
import { refReplyKeyboard } from '../keyboards';
import type { BotContext } from '../telegram.update';

@Update()
export class ReferralsHandler {
  constructor(private readonly referralService: TelegramReferralService) {}

  @Hears(REPLY_BTN_REF)
  async onReplyRef(@Ctx() ctx: BotContext) {
    const refsys = await this.referralService.getRef(ctx.from?.id ?? 0);

    await ctx.reply(
      '🤝 Реферальная система\n\nПриглашено пользователей: ' + refsys?.User.length + "\nЗаработано: " + refsys?.refEarned + '\n\nВаша реферальная ссылка: https://t.me/lessononeone_bot?start=' + ctx.from?.id,
      refReplyKeyboard(),
    );
  }
}
