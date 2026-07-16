import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class TelegramReferralService {
  constructor(private prisma: PrismaService) {}

  async getRef(telegramId: number) {
    return await this.prisma.refSystem.findFirst({
      where: { id: telegramId },
      include: { User: true }
    });
  }
}
