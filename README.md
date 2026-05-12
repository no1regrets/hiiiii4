# Telegram-бот: шаблон на NestJS + Telegraf

Минимальный каркас для старта нового бота: команды `/start` и `/help`, кнопка «Меню», действия **Ping** и **Echo**. Данные пользователя Telegram сохраняются в **PostgreSQL** через **Prisma** при первом `/start`. REST API нет.

## Требования

- Node.js 20+ (рекомендуется актуальный LTS)
- npm

## Быстрый старт

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Создайте бота в Telegram через [@BotFather](https://t.me/BotFather), скопируйте токен.

3. Скопируйте пример окружения и подставьте токен:

   ```bash
   cp .env.example .env
   ```

   В `.env` задайте `BOT_TOKEN=...` и **`DATABASE_URL=...`** (к БД из шага ниже).

4. Поднимите PostgreSQL и примените миграции:

   ```bash
   docker compose up -d
   npx prisma migrate deploy
   ```

5. Запуск в режиме разработки:

   ```bash
   npm run start:dev
   ```

6. В Telegram откройте бота и отправьте `/start`.

## Prisma 7

- Строка подключения к БД задаётся в **`prisma.config.ts`** (и в `.env` как `DATABASE_URL`), не в `schema.prisma`.
- Рантайм: `PrismaService` создаёт клиент через `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
- После изменения схемы: `npm run prisma:migrate` или `npx prisma generate`.

### Ошибка «Database `database` does not exist» (P1003)

В `DATABASE_URL` должно быть имя БД, как в Docker: **`nest_bot`**, не `database`. Пример:  
`postgresql://postgres:postgres@127.0.0.1:5432/nest_bot?schema=public`

## Telegram: `ETIMEDOUT` к api.telegram.org

Запрос `getMe` идёт на серверы Telegram. Если в логах **`FetchError`** / **`ETIMEDOUT`**, сеть до `api.telegram.org` недоступна (файрвол, блокировка, офисная сеть).

Что можно сделать:

1. **VPN** или доступ в интернет, где Telegram не режется.
2. **Прокси** — в `.env` задайте `TELEGRAM_HTTPS_PROXY=http://хост:порт` (или стандартный **`HTTPS_PROXY`**) — запросы бота пойдут через [https-proxy-agent](https://www.npmjs.com/package/https-proxy-agent).
3. **Только API без бота** — `TELEGRAM_SKIP_LAUNCH=true` (Nest и Prisma поднимутся, long polling не стартует).

## Локальная PostgreSQL (Docker)

1. Поднимите БД:

   ```bash
   docker compose up -d
   ```

2. Скопируйте строку из [`.env.example`](.env.example) в `.env` как `DATABASE_URL=...` (или свою), если ещё не задали.

3. Остановка и удаление контейнера (данные в volume сохраняются):

   ```bash
   docker compose down
   ```

## Скрипты

| Команда           | Назначение        |
|-------------------|-------------------|
| `npm run start:dev` | Разработка (watch) |
| `npm run build`   | `prisma generate` + сборка TypeScript |
| `npm run start:prod` | Запуск из `dist` |
| `npm run lint`    | ESLint            |
| `npm test`        | Unit-тесты (Jest) |
| `npm run test:e2e` | Проверка компиляции модуля |
| `npm run prisma:migrate` | `prisma migrate dev` (разработка) |
| `npm run prisma:deploy` | `prisma migrate deploy` (прод/CI) |
| `npm run prisma:studio` | Prisma Studio |

## Структура

- [`src/main.ts`](src/main.ts) — точка входа Nest.
- [`src/app.module.ts`](src/app.module.ts) — `ConfigModule`, **`PrismaModule`**, `TelegrafModule`.
- [`src/prisma/`](src/prisma/) — глобальный модуль и `PrismaService` (`PrismaClient` + **`@prisma/adapter-pg`** по `DATABASE_URL`).
- [`prisma/schema.prisma`](prisma/schema.prisma) — модели (в datasource **нет** `url` — это [Prisma ORM 7](https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7)).
- [`prisma.config.ts`](prisma.config.ts) — URL для CLI (миграции) и `datasource.url` из `DATABASE_URL`.
- `generated/prisma/` — сгенерированный клиент Prisma 7 (`prisma generate`), каталог в `.gitignore`.
- [`src/services/telegram/`](src/services/telegram/) — модуль бота:
  - `telegram.update.ts` — хендлеры команд и callback;
  - `keyboards.ts` — inline-клавиатуры;
  - `constants.ts` — строки callback-data.

## Как добавить кнопку или сценарий

1. В [`src/services/telegram/constants.ts`](src/services/telegram/constants.ts) добавьте константу callback-data (например `export const CALLBACK_ABOUT = 'about'`).
2. В [`src/services/telegram/keyboards.ts`](src/services/telegram/keyboards.ts) добавьте кнопку `Markup.button.callback('Текст', CALLBACK_ABOUT)`.
3. В [`src/services/telegram/telegram.update.ts`](src/services/telegram/telegram.update.ts) добавьте метод с декоратором `@Action(CALLBACK_ABOUT)`.

Для новых команд используйте `@Command('имя')` или встроенные `@Start()` / `@Help()` из `nestjs-telegraf`.

## Переменные окружения

| Переменная   | Описание |
|-------------|----------|
| `BOT_TOKEN` | **Обязательно.** Токен бота от BotFather. |
| `DATABASE_URL` | **Обязательно для запуска приложения.** Строка подключения к PostgreSQL (см. `compose.yml`). |
| `PORT`      | Опционально. Порт HTTP-сервера Nest (по умолчанию `3000`). |
| `TELEGRAM_SKIP_LAUNCH` | Опционально. Если `true`, не вызывается `bot.launch()` (тесты, CI, нет доступа к Telegram). |
| `TELEGRAM_HTTPS_PROXY` | Опционально. URL HTTPS-прокси для запросов к API Telegram (например `http://127.0.0.1:7890`). |
| `HTTPS_PROXY` / `https_proxy` | Опционально. То же, что прокси: если задано, используется при отсутствии `TELEGRAM_HTTPS_PROXY`. |

## Лицензия

UNLICENSED (частный/учебный шаблон — при необходимости смените в `package.json`).
