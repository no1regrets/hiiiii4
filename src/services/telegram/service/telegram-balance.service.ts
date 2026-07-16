import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TelegramUserService } from './telegram-user.service';

@Injectable()
export class TelegramBalanceService {
  constructor(
    private prisma: PrismaService,
    private userService: TelegramUserService,
  ) {}

  async getUserBalance(telegramId: number) {
    const user = await this.userService.getUser(telegramId);
    return user?.balance ?? 0;
  }

  async updateUserBalance(telegramId: number, amount: number) {
    const user = await this.userService.getUser(telegramId);
    const newBalance = user!.balance + amount;
    return await this.prisma.user.update({
      where: { telegramId },
      data: { balance: newBalance }
    });
  }
}
