/**
 * Заглушка PrismaClient для e2e: сгенерированный клиент v7 — ESM с import.meta,
 * Jest в режиме CJS его не трансформирует.
 */
export class PrismaClient {
  constructor(options?: { adapter?: unknown }) {
    void options;
  }

  $connect(): Promise<void> {
    return Promise.resolve();
  }

  $disconnect(): Promise<void> {
    return Promise.resolve();
  }
}
