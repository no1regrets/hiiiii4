import { Action, Hears, Ctx, Update } from 'nestjs-telegraf';
import { TelegramProductService } from '../service/telegram-product.service';
import { TelegramBalanceService } from '../service/telegram-balance.service';
import {
  CALLBACK_NEXT_LIST,
  CALLBACK_PREV_LIST,
  CALLBACK_CATALOGUE_BACK,
  CALLBACK_PRODUCT_1,
  CALLBACK_PRODUCT_2,
  CALLBACK_PRODUCT_3,
  CALLBACK_PRODUCT_4,
  CALLBACK_BUY,
  CALLBACK_CONFIRMED_BUY_BUTTON,
  REPLY_BTN_LIST,
} from '../constants';
import {
  catalogKeyboard,
  productKeyboard,
  notEnoughFundsKeyboard,
  confirmPurchaseKeyboard
} from '../keyboards';
import type { BotContext, Products } from '../telegram.update';

@Update()
export class ProductsHandler {
  constructor(
    private readonly productService: TelegramProductService,
    private readonly balanceService: TelegramBalanceService,
  ) {}

  @Hears(REPLY_BTN_LIST)
  async onReplyList(@Ctx() ctx: BotContext) {
    ctx.session!.currentCataloguePage = 1;
    const pageCount = await this.productService.getPagesCount(4);
    const products = await this.productService.getProducts(1, 4);
    ctx.session!.currentPagesCount = pageCount;
    ctx.session!.lastmessageid = (await ctx.reply('📦 Каталог товаров', catalogKeyboard(products as Products[], 1))).message_id;
  }

  @Action(CALLBACK_NEXT_LIST)
  async onNextList(@Ctx() ctx: BotContext) {
    const currentPage = ctx.session!.currentCataloguePage;
    if (currentPage! < ctx.session!.currentPagesCount!) {
      ctx.session!.currentCataloguePage = currentPage! + 1;
      const products = await this.productService.getProducts(ctx.session!.currentCataloguePage!, 4);
      await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session!.lastmessageid, undefined, '📦 Каталог товаров', catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));
      return;
    }
    ctx.session!.currentCataloguePage = 1;
    const products = await this.productService.getProducts(ctx.session!.currentCataloguePage!, 4);
    await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session!.lastmessageid, undefined, '📦 Каталог товаров', catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));
  }

  @Action(CALLBACK_PREV_LIST)
  async onPrevList(@Ctx() ctx: BotContext) {
    const currentPage = ctx.session!.currentCataloguePage;
    if (currentPage! > 1) {
      ctx.session!.currentCataloguePage = currentPage! - 1;
      const products = await this.productService.getProducts(ctx.session!.currentCataloguePage!, 4);
      await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session!.lastmessageid, undefined, '📦 Каталог товаров', catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));
      return;
    }
    ctx.session!.currentCataloguePage = ctx.session!.currentPagesCount;
    const products = await this.productService.getProducts(ctx.session!.currentCataloguePage!, 4);
    await ctx.telegram.editMessageText(ctx.chat!.id, ctx.session!.lastmessageid, undefined, '📦 Каталог товаров', catalogKeyboard(products as Products[], ctx.session!.currentCataloguePage!));
  }

  @Action(CALLBACK_CATALOGUE_BACK)
  async onCatalogueBack(@Ctx() ctx: BotContext) {
    ctx.session!.currentCataloguePage = 1;
    const pageCount = await this.productService.getPagesCount(4);
    const products = await this.productService.getProducts(1, 4);
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

  private async onProduct(ctx: BotContext, productIndex: number) {
    const currentPage = ctx.session!.currentCataloguePage;
    const products = await this.productService.getProducts(currentPage!, 4);
    const product = products[productIndex];
    ctx.session!.currentProductId = product.id;
    await ctx.reply('📦 Товар: ' + product.name + '\n\nОписание: ' + product.description + '\n\nЦена за единицу: ' + product.price + '\n', productKeyboard());
  }

  @Action(CALLBACK_BUY)
  async onBuy(@Ctx() ctx: BotContext) {
    const productId = ctx.session!.currentProductId;
    if (!productId) {
      await ctx.reply('Ошибка: не удалось определить товар. Пожалуйста, попробуйте снова.');
      return;
    }
    const product = await this.productService.getProductById(productId);
    if (!product) {
      await ctx.reply('Ошибка: товар не найден. Пожалуйста, попробуйте снова.');
      return;
    }
    const userBalance = await this.balanceService.getUserBalance(ctx.from?.id ?? 0);
    if (userBalance < product.price) {
      await ctx.reply('Ошибка: недостаточно средств на балансе. Пожалуйста, пополните баланс и попробуйте снова.', notEnoughFundsKeyboard());
      return;
    }
    const message =  await ctx.reply('Вы собираетесь приобрести товар: **' + product.name + '**\nЦена за единицу: **' + product.price + '₽**\n\nОписание товара: **' + product.description + '**\n\nПодтвердите действие:', confirmPurchaseKeyboard());
    ctx.session!.lastmessageid = message.message_id;
  }

  @Action(CALLBACK_CONFIRMED_BUY_BUTTON)
  async onConfirmedBuy(@Ctx() ctx: BotContext) {
    const productId = ctx.session!.currentProductId;
    ctx.deleteMessage(ctx.session!.lastmessageid);
    if (!productId) {
      await ctx.reply('Ошибка: не удалось определить товар. Пожалуйста, попробуйте снова.');
      return;
    }
    const product = await this.productService.getProductById(productId);
    if (!product) {
      await ctx.reply('Ошибка: товар не найден. Пожалуйста, попробуйте снова.');
      return;
    }
    const userBalance = await this.balanceService.getUserBalance(ctx.from?.id ?? 0);
    if (userBalance < product.price) {
      await ctx.reply('Ошибка: недостаточно средств на балансе. Пожалуйста, пополните баланс и попробуйте снова.', notEnoughFundsKeyboard());
      return;
    }
    await this.balanceService.updateUserBalance(ctx.from?.id ?? 0, -product.price);
    const productData = await this.productService.productDelivery(productId, ctx.from?.id ?? 0);
    const finalbalance = userBalance - product.price;
    await ctx.reply('✅ Вы успешно приобрели товар: **' + product.name + '**\n\nТекущий баланс: **' + finalbalance + '**\n\nДанные товара: **' + productData  + '**');
  }
}
