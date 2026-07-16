import { Action, Hears, On, Ctx, Update } from 'nestjs-telegraf';
import { TelegramProductService } from '../service/telegram-product.service';
import {
  REPLY_BTN_ADMIN_MAIN,
  REPLY_ADMIN_ADD_ITEM,
  REPLY_ADMIN_BACK,
  CALLBACK_ADMIN_PUBLISH_ITEM,
} from '../constants';
import {
  adminMainKeyboard,
  addItemKeyboard,
  adminBackCallback,
} from '../keyboards';
import { PostDto } from '../dto/post.dto';
import type { BotContext } from '../telegram.update';

@Update()
export class AdminHandler {
  constructor(private readonly productService: TelegramProductService) {}

  @Hears(REPLY_BTN_ADMIN_MAIN)
  async onReplyAdminMain(@Ctx() ctx: BotContext) {
    if (!ctx.session?.isAdmin) {
      await ctx.reply('У вас нет доступа к админ-панели.');
      return;
    }
    await ctx.reply('⚙️ Админ-панель\n\nВыберите действие:', adminMainKeyboard());
  }

  @Hears(REPLY_ADMIN_ADD_ITEM)
  async onReplyAdminAddItem(@Ctx() ctx: BotContext) {
    if (!ctx.session?.isAdmin) {
      await ctx.reply('У вас нет доступа к админ-панели.');
      return;
    }
    ctx.session = { ...ctx.session, scene: 'addProduct', addProductStep: 'name' };
    const message = await ctx.reply('➕ Добавление товара\n\nВведите название товара:', addItemKeyboard());
    ctx.session.lastmessageid = message.message_id;
  }

  @Hears(REPLY_ADMIN_BACK)
  async onReplyAdminBack(@Ctx() ctx: BotContext) {
    await ctx.reply('⚙️ Админ-панель\n\nВыберите действие:', adminMainKeyboard());
  }

  @Action(CALLBACK_ADMIN_PUBLISH_ITEM)
  async onAdminPublishItem(@Ctx() ctx: BotContext) {
    const createdPost = await this.productService.createPost(ctx.session!.productDraft as PostDto);
    if (!createdPost) {
      await ctx.reply('Ошибка при публикации товара. Пожалуйста, попробуйте снова.', adminBackCallback());
      return;
    }
    await ctx.reply('Товар опубликован:\n\n' + "Название: " + createdPost.name + "\nОписание: " + createdPost.description + "\nЦена за единицу: " + createdPost.price + "\nДанные товара: " + JSON.stringify(createdPost.productData));
    await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session!.lastmessageid, undefined, 'Товар опубликован');
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const msg = ctx.message;
    if (!msg || !('text' in msg)) return;
    const text = msg.text;
    if (!text || text.startsWith('/')) return;
    if (ctx.session?.scene === 'addProduct') {
      const step = ctx.session.addProductStep;
      if (step === 'name') {
        ctx.session.productDraft = { name: text };
        await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session.lastmessageid, undefined, 'Название товара: ' + text);
        ctx.session.addProductStep = 'description';
        const message = await ctx.reply('Введите описание товара:', addItemKeyboard());
        ctx.session.lastmessageid = message.message_id;
        return;
      }
      if (step === 'description') {
        ctx.session.productDraft = { ...ctx.session.productDraft, description: text };
        ctx.session.addProductStep = 'price';
        await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session.lastmessageid, undefined, 'Описание товара: ' + text);
        const message = await ctx.reply('Введите цену за единицу товара:', addItemKeyboard());
        ctx.session.lastmessageid = message.message_id;
        return;
      }
      if (step === 'price') {
        ctx.session.productDraft = { ...ctx.session.productDraft, price: parseFloat(text) };
        ctx.session.addProductStep = 'data';
        await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session.lastmessageid, undefined, 'Цена за единицу: ' + text);
        const message = await ctx.reply('Добавьте товар\n\nСсылки на товар должны указываться через запятую:', addItemKeyboard());
        ctx.session.lastmessageid = message.message_id;
        return;
      }
      if (step === 'data') {
        ctx.session.productDraft = { ...ctx.session.productDraft, data: text };
        await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session.lastmessageid, undefined, 'Данные товара: ' + text);
        const message = await ctx.reply(
          'Товар добавлен в черновик:\n\n' +
          'Название: ' + ctx.session.productDraft.name +
          '\nОписание: ' + ctx.session.productDraft.description +
          '\nЦена за единицу: ' + ctx.session.productDraft.price +
          '\nДанные товара: ' + ctx.session.productDraft.data,
          addItemKeyboard(true),
        );
        ctx.session.lastmessageid = message.message_id;
        return;
      }
    }
    await ctx.reply(text);
  }
}
