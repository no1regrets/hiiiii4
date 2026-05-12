import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TelegramUpdate, TelegramService, PrismaService],
})
export class TelegramModule {}
