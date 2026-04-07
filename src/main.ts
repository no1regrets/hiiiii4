import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),

    );
  const config = new DocumentBuilder()
        .setTitle('API проекта')
        .setDescription(
            'REST API для управления проектами, пользователями, компаниями, подборками и уведомлениями. ' +
            'Эндпоинты с 🔐 требуют заголовка Authorization: Bearer <accessToken>. ' +
            'Метки в описаниях: 👤 — проверка владельца, 🏢 — проверка роли в компании.',
        )
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
