import { Start, Hears, Ctx } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
import { mainReplyKeyboard } from './keyboards';
import { UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TelegramService {
    constructor(private prisma: PrismaService) { }

    async createOrUpdateUser(dto: UserDto) {
        console.log("Upserting user:", { dto });
        let finalUser;
        const user = await this.getUser(dto.telegramId);
        if (user) {
            finalUser = await this.prisma.user.update({
                where: { telegramId: dto.telegramId },
                data: {
                    username: dto.username ?? null,
                    firstName: dto.firstName ?? null,
                }
            });
        } else {
            finalUser = await this.prisma.user.create({
                data: {
                    telegramId: dto.telegramId,
                    username: dto.username ?? null,
                    firstName: dto.firstName ?? null,
                    refId: dto.refId ?? null,
                }
            })
            await this.prisma.refSystem.create({
                data: {
                    id: dto.telegramId,
                }
            });
        }
        return finalUser;
    }
    async getUser(telegramId: number) {
            const user = await this.prisma.user.findFirst({
                where: { telegramId },
                select: {
                    telegramId: true,
                    username: true,
                    firstName: true,
                    createdAt: true,
                    is_admin: true,
                }
            });
            return user;
        }


    async getRef(telegramId: number) {
            const refsys = await this.prisma.refSystem.findFirst({
                where: { id: telegramId }, include: { User: true }
            });
            return refsys;
        }
    }