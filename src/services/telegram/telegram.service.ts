import { Start, Hears, Ctx } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { mainReplyKeyboard } from './keyboards';
import { UserDto } from './dto/user.dto';


export class TelegramService {
    constructor(private prisma: PrismaService) { }

    async upsertUser(dto: UserDto) {
        console.log("Upserting user:", {dto});
        await this.prisma.user.upsert({
            where: { telegramId: dto.telegramId },
            create: {
                telegramId: dto.telegramId,
                username: dto.username ?? null,
                firstName: dto.firstName ?? null,
            },
            update: {
                username: dto.username ?? null,
                firstName: dto.firstName ?? null,
            },
        }
        );
        await this.prisma.refSystem.upsert({
            where: { id: dto.telegramId },
            create: {
                id: dto.telegramId,
                User: { connect: { telegramId: dto.telegramId } },
            },
            update: {},
        }
        );
        return "ok";
    }



    async getRef(telegramId: number) {
        const refsys = await this.prisma.refSystem.findFirst({
            where: { id: telegramId }, include: { User: true }
        });
        return refsys;
    }
}