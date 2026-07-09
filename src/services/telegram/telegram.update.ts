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
  CALLBACK_ADMIN_PUBLISH_ITEM,
  CALLBACK_BACK,
  CALLBACK_BUY,
  CALLBACK_CATALOGUE_BACK,
  CALLBACK_CONFIRMED_BUY_BUTTON,
  CALLBACK_ECHO,
  CALLBACK_MENU,
  CALLBACK_NEXT_LIST,
  CALLBACK_PING,
  CALLBACK_PREV_LIST,
  CALLBACK_PRODUCT_1,
  CALLBACK_PRODUCT_2,
  CALLBACK_PRODUCT_3,
  CALLBACK_PRODUCT_4,
  REPLY_ADMIN_ADD_ITEM,
  REPLY_ADMIN_BACK,
  REPLY_BTN_ADMIN_MAIN,
  REPLY_BTN_BACK,
  REPLY_BTN_ECHO,
  REPLY_BTN_HELP,
  REPLY_BTN_HIDE,
  REPLY_BTN_LIST,
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
  adminMainKeyboard,
  addItemKeyboard,
  adminBackCallback,
  catalogKeyboard,
  productKeyboard,
  notEnoughFundsKeyboard
} from './keyboards';
import { TelegramService } from './telegram.service';
import { PostDto } from './dto/post.dto';

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
    data?: string; // object
  }
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

    ctx.session = { isAdmin: user.isAdmin };
    await ctx.reply(
      '🤖 Главное меню\n\nВыберите действие:',
      mainReplyKeyboard(ctx.session.isAdmin),
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
    await ctx.reply('🤖 Главное меню\n\nВыберите действие:', mainReplyKeyboard(ctx.session!.isAdmin));
  }

  @Hears(REPLY_BTN_LIST)
  async onReplyList(@Ctx() ctx: BotContext) {
    ctx.session!.currentCataloguePage = 1;
    const pageCount = await this.telegramService.getPagesCount(4);
    const products = await this.telegramService.getProducts(1, 4);
    ctx.session!.currentPagesCount = pageCount;
    ctx.session!.lastmessageid = (await ctx.reply('📦 Каталог товаров', catalogKeyboard(products as Products[], 1))).message_id;
  }

  @Action(CALLBACK_NEXT_LIST)
  async onNextList(@Ctx() ctx: BotContext) {
    const currentPage = ctx.session!.currentCataloguePage;
    console.log("Current page:", currentPage, "Current pages count:", ctx.session!.currentPagesCount);
    if(currentPage! < ctx.session!.currentPagesCount!) {
      ctx.session!.currentCataloguePage = currentPage! + 1;
      const products = await this.telegramService.getProducts(ctx.session!.currentCataloguePage!, 4); 
      await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session!.lastmessageid,undefined,`📦 Каталог товаров`, catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));    
      return;
    }
      ctx.session!.currentCataloguePage = 1;
      const products = await this.telegramService.getProducts(ctx.session!.currentCataloguePage!, 4);
      await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session!.lastmessageid,undefined,`📦 Каталог товаров`, catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));    
    
  }

  @Action(CALLBACK_PREV_LIST)

  async onPrevList(@Ctx() ctx: BotContext) {
    const currentPage = ctx.session!.currentCataloguePage;
    console.log("Current page:", currentPage, "Current pages count:", ctx.session!.currentPagesCount);
    if(currentPage! > 1) {
      ctx.session!.currentCataloguePage = currentPage! - 1;
      const products = await this.telegramService.getProducts(ctx.session!.currentCataloguePage!, 4);
      await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session!.lastmessageid,undefined,`📦 Каталог товаров`, catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));    
      return;
    }
    ctx.session!.currentCataloguePage = ctx.session!.currentPagesCount;
    const products = await this.telegramService.getProducts(ctx.session!.currentCataloguePage!, 4);
    await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session!.lastmessageid,undefined,`📦 Каталог товаров`, catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));
  }

  @Action(CALLBACK_CATALOGUE_BACK)

  async onCatalogueBack(@Ctx() ctx: BotContext) {
    ctx.session!.currentCataloguePage = 1;
    const pageCount = await this.telegramService.getPagesCount(4);
    const products = await this.telegramService.getProducts(1, 4);
    ctx.session!.currentPagesCount = pageCount;
    ctx.session!.lastmessageid = (await ctx.reply('📦 Каталог товаров', catalogKeyboard(products as Products[], 1))).message_id;
  }

  @Action(CALLBACK_PRODUCT_1)

  async onProduct1(@Ctx() ctx: BotContext) {
    await this.onProduct(ctx, 0);
  }

  @Action(CALLBACK_PRODUCT_2)

  async onProduct2(@Ctx() ctx: BotContext) {
    await this.onProduct(ctx, 1);
  }

  @Action(CALLBACK_PRODUCT_3)

  async onProduct3(@Ctx() ctx: BotContext) {
    await this.onProduct(ctx, 2);
  }

  @Action(CALLBACK_PRODUCT_4)

  async onProduct4(@Ctx() ctx: BotContext) {
    await this.onProduct(ctx, 3);
  }


  private async onProduct(@Ctx() ctx: BotContext, productIndex: number) {
    const currentPage = ctx.session!.currentCataloguePage;
    const products = await this.telegramService.getProducts(currentPage!, 4);
    const product = products[productIndex];
    ctx.session!.currentProductId = product.id;
    return await ctx.reply('📦 Товар: ' + product.name + '\n\nОписание: ' + product.description + '\n\nЦена за единицу: ' + product.price + '\n', productKeyboard());
  }


@Action(CALLBACK_BUY)

async onBuy(@Ctx() ctx: BotContext) {
  
    const productId = ctx.session!.currentProductId;
    if (!productId) {
      await ctx.reply('Ошибка: не удалось определить товар. Пожалуйста, попробуйте снова.');
      return;
    }
    const product = await this.telegramService.getProductById(productId);
    if (!product) {
      await ctx.reply('Ошибка: товар не найден. Пожалуйста, попробуйте снова.');
      return;
    }
    const userBalance = await this.telegramService.getUserBalance(ctx.from?.id ?? 0);
    if (userBalance < product.price) {
      await ctx.reply('Ошибка: недостаточно средств на балансе. Пожалуйста, пополните баланс и попробуйте снова.', notEnoughFundsKeyboard());
      return;
    }
    await ctx.reply('Вы собираетесь приобрести товар: **' + product.name + '**\nЦена за единицу: **' + product.price + '₽**\n\nОписание товара: **' + product.description + '**\n\nПодтвердите действие:', productKeyboard());

}

@Action(CALLBACK_CONFIRMED_BUY_BUTTON)
async onConfirmedBuy(@Ctx() ctx: BotContext) {
  const productId = ctx.session!.currentProductId;
  if (!productId) {
    await ctx.reply('Ошибка: не удалось определить товар. Пожалуйста, попробуйте снова.');
    return;
  }
  const product = await this.telegramService.getProductById(productId);
    if (!product) {
      await ctx.reply('Ошибка: товар не найден. Пожалуйста, попробуйте снова.');
      return;
    }
    const userBalance = await this.telegramService.getUserBalance(ctx.from?.id ?? 0);
    if (userBalance < product.price) {
      await ctx.reply('Ошибка: недостаточно средств на балансе. Пожалуйста, пополните баланс и попробуйте снова.', notEnoughFundsKeyboard());
      return;
    }
    
}

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
    const steps = ["name", 'description', 'price', 'data'];
    ctx.session = { ...ctx.session, scene: 'addProduct', addProductStep: 'name' };
    const message = await ctx.reply('➕ Добавление товара\n\nВведите название товара:', addItemKeyboard());
    ctx.session.lastmessageid = message.message_id;
  }



  @Hears(REPLY_ADMIN_BACK)
  async onReplyAdminBack(@Ctx() ctx: BotContext) {
    await ctx.reply('⚙️ Админ-панель\n\nВыберите действие:', adminMainKeyboard());
  }

  @Hears(REPLY_BTN_SUPPORT)
  async onReplySupport(@Ctx() ctx: BotContext) {
    await ctx.reply('🛠 Поддержка\n\nЕсли вам нужна помощь с заказом, пополнением баланса или другой проблемой, напишите агенту поддержки!\n\nЧасы работы: 9:00-21:00 (по московскому времени)', supportKeyboard());
  }


  @Action(CALLBACK_ADMIN_PUBLISH_ITEM)
  async onAdminPublishItem(@Ctx() ctx: BotContext) {
    // if (!ctx.session?.isAdmin) {
    //   await ctx.reply('У вас нет доступа к админ-панели.');
    //   return;
    // }
    const createdPost = await this.telegramService.createPost(ctx.session!.productDraft as PostDto);
    // ctx.session.scene = 'default';
    // ctx.session.productDraft = undefined;
    // ctx.session.addProductStep = undefined;
    if (!createdPost) {
      await ctx.reply('Ошибка при публикации товара. Пожалуйста, попробуйте снова.', adminBackCallback());
      return;
    }
    await ctx.reply('Товар опубликован:\n\n' + "Название: " + createdPost.name + "\nОписание: " + createdPost.description + "\nЦена за единицу: " + createdPost.price + "\nДанные товара: " + JSON.stringify(createdPost.productData));
    await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session!.lastmessageid,undefined,`Товар опубликован`);
    return;
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
        ctx.session.productDraft = { name: text};
        await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session.lastmessageid,undefined,`Название товара: ${text}`);
        ctx.session.addProductStep = 'description';
        const message = await ctx.reply('Введите описание товара:', addItemKeyboard());
        ctx.session.lastmessageid = message.message_id;
        return;
      }
      if (step === 'description') {
        ctx.session.productDraft = { ...ctx.session.productDraft, description: text };
        ctx.session.addProductStep = 'price';
        await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session.lastmessageid,undefined,`Описание товара: ${text}`);
        const message = await ctx.reply('Введите цену за единицу товара:', addItemKeyboard());
        ctx.session.lastmessageid = message.message_id;
        return;
      }
      if (step === 'price') {
        ctx.session.productDraft = { ...ctx.session.productDraft, price: parseFloat(text) };
        ctx.session.addProductStep = 'data';
        await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session.lastmessageid,undefined,`Цена за единицу: ${text}`);
        const message = await ctx.reply('Добавьте товар', addItemKeyboard());
        ctx.session.lastmessageid = message.message_id;
        return;
      }
      if (step === 'data') {

        ctx.session.productDraft = { ...ctx.session.productDraft, data: text };
        await ctx.telegram.editMessageText(ctx.chat!.id,ctx.session.lastmessageid,undefined,`Данные товара: ${text}`);
        const message = await ctx.reply('Товар добавлен в черновик:\n\n' + "Название: " + ctx.session.productDraft.name + "\nОписание: " + ctx.session.productDraft.description + "\nЦена за единицу: " + ctx.session.productDraft.price + "\nДанные товара: " + ctx.session.productDraft.data, addItemKeyboard(true, true));
        ctx.session.lastmessageid = message.message_id;
        return;
      }
    }
    await ctx.reply(text);
  }
}
