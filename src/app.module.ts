import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { session } from 'telegraf';
import type { Telegraf } from 'telegraf';
import { TelegramModule } from './services/telegram/telegram.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    PrismaModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const proxyUrl =
          config.get<string>('TELEGRAM_HTTPS_PROXY')?.trim() ||
          config.get<string>('HTTPS_PROXY')?.trim() ||
          config.get<string>('https_proxy')?.trim();

        const options: Partial<Telegraf.Options<never>> | undefined = proxyUrl
          ? {
              telegram: {
                agent: new HttpsProxyAgent(proxyUrl),
              },
            }
          : undefined;

        return {
          token: config.getOrThrow<string>('BOT_TOKEN'),
          middlewares: [session()],
          options,
          /** В тестах/CI или без доступа к api.telegram.org: TELEGRAM_SKIP_LAUNCH=true — не вызывать bot.launch(). */
          launchOptions:
            config.get<string>('TELEGRAM_SKIP_LAUNCH') === 'true'
              ? false
              : undefined,
        };
      },
      inject: [ConfigService],
    }),
    TelegramModule,
  ],
})
export class AppModule {}
