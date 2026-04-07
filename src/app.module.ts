import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from "./services/user.module"
import { PrismaModule } from "./prisma/prisma.module"
import { ConfigModule, ConfigService } from '@nestjs/config';
import LocalSession from 'telegraf-session-local';
import { TelegrafModule } from 'nestjs-telegraf';
import * as process from "node:process";


const sessions = new LocalSession({ database: 'session_db.json' });

const config = {
  imports: [ConfigModule.forRoot({ isGlobal: true , envFilePath: '.env' }), UserModule, PrismaModule, TelegrafModule.forRoot({
        middlewares: [sessions.middleware()],
        token: process.env.BOT_TOKEN ?? "",
    })],
  controllers: [AppController],
  providers: [AppService],
}




@Module(config)
export class AppModule {}
