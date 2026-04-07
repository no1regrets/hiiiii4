import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramUpdate } from './telegram.update';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [TelegramService, TelegramUpdate, PrismaService],
})
export class TelegramModule {}
  