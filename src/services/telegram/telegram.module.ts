import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramUpdate } from './telegram.update';
import { StartHandler } from './handlers/start.handler';
import { ProfileHandler } from './handlers/profile.handler';
import { BalanceHandler } from './handlers/balance.handler';
import { ProductsHandler } from './handlers/products.handler';
import { ReferralsHandler } from './handlers/referrals.handler';
import { AdminHandler } from './handlers/admin.handler';
import { TelegramUserService } from './service/telegram-user.service';
import { TelegramProductService } from './service/telegram-product.service';
import { TelegramBalanceService } from './service/telegram-balance.service';
import { TelegramReferralService } from './service/telegram-referral.service';

@Module({
  providers: [
    TelegramUpdate,
    StartHandler,
    ProfileHandler,
    BalanceHandler,
    ProductsHandler,
    ReferralsHandler,
    AdminHandler,
    TelegramUserService,
    TelegramProductService,
    TelegramBalanceService,
    TelegramReferralService,
    PrismaService,
  ],
})
export class TelegramModule {}
