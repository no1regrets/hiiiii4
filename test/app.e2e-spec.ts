import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppModule (e2e)', () => {
  beforeAll(() => {
    process.env.BOT_TOKEN = '000000:dummy-token-for-compile-tests-only';
    process.env.TELEGRAM_SKIP_LAUNCH = 'true';
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@127.0.0.1:5432/nest_bot?schema=public';
  });

  it('compiles (без app.init — без telegraf launch и без реального Prisma)', async () => {
    const mockPrisma = {
      onModuleInit: () => Promise.resolve(),
      onModuleDestroy: () => Promise.resolve(),
      user: { upsert: jest.fn().mockResolvedValue({}) },
    } as unknown as PrismaService;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    expect(moduleRef).toBeDefined();
  });
});
