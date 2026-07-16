import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserDto } from '../dto/user.dto';

@Injectable()
export class TelegramUserService {
  constructor(private prisma: PrismaService) {}

  async createOrUpdateUser(dto: UserDto) {
    const user = await this.getUser(dto.telegramId);
    if (user) {
      return await this.prisma.user.update({
        where: { telegramId: dto.telegramId },
        data: {
          username: dto.username ?? null,
          firstName: dto.firstName ?? null,
        }
      });
    }
    const newUser = await this.prisma.user.create({
      data: {
        telegramId: dto.telegramId,
        username: dto.username ?? null,
        firstName: dto.firstName ?? null,
        refId: dto.refId ?? null,
      }
    });
    await this.prisma.refSystem.create({
      data: { id: dto.telegramId }
    });
    return newUser;
  }

  async getUser(telegramId: number) {
    return await this.prisma.user.findFirst({
      where: { telegramId },
      select: {
        telegramId: true,
        username: true,
        balance: true,
        firstName: true,
        createdAt: true,
        isAdmin: true,
      }
    });
  }
}
