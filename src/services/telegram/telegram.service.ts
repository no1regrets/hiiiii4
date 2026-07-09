import { Start, Hears, Ctx } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { PrismaService } from '../../prisma/prisma.service';
// @ts-ignore
import { Prisma } from '@prisma/client'; 
import { mainReplyKeyboard } from './keyboards';
import { UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { Console } from 'console';

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
                    balance: true,
                    firstName: true,
                    createdAt: true,
                    isAdmin: true,
                }
            });
            return user;
        }

    async createPost(dto: PostDto) {
        const title = dto.name;
        const description = dto.description;
        const price = dto.price;
        const dataaa = dto.data ? JSON.parse(dto.data) : {};
        console.log(dataaa, title);
        const post = await this.prisma.products.create({
            data: {
                description,
                price,
                name: title,
                productData: dataaa as Prisma.JsonObject,
            }
        });
        return post;
    }

    async getUserBalance(telegramId: number) {
        const user = await this.getUser(telegramId);
        return user?.balance ?? 0;
    }

    async updateUserBalance(telegramId: number, amount: number) {
        const user = await this.getUser(telegramId);
        const newBalance = user!.balance + amount;
        return await this.prisma.user.update({
            where: { telegramId },
            data: { balance: newBalance }
        });
    }

    async getProducts(page: number = 1, pageSize: number = 4) {
        const products = await this.prisma.products.findMany({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        return products;
    }

    async getProductById(productId: string) {
        const product = await this.prisma.products.findUnique({
            where: { id: productId },
        });
        return product;
    }

    async getPagesCount(pageSize: number) {
        const totalCount = await this.prisma.products.count();
        return Math.ceil(totalCount / pageSize);
    }


    async getRef(telegramId: number) {
            const refsys = await this.prisma.refSystem.findFirst({
                where: { id: telegramId }, include: { User: true }
            });
            return refsys;
        }
    }