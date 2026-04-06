import { PrismaPg } from '@prisma/adapter-pg';
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '../generated/prisma/client';

/**
 * Create a PrismaClient instance with the pg driver adapter.
 * Use this when you need to instantiate the client with a specific connection string
 * (e.g. in NestJS from ConfigService). Do not extend PrismaClient and pass an adapter
 * in a subclass constructor — that pattern is incompatible with Prisma 7.x.
 * Pass only a string to PrismaPg so pg never receives an object (avoids ERR_INVALID_ARG_TYPE).
 */
export function createPrismaClient(connectionString: string) {
    const url =
        typeof connectionString === 'string' && connectionString.trim()
            ? connectionString.trim()
            : String(connectionString ?? '').trim();
    if (!url || !url.startsWith('postgres')) {
        throw new Error(
            `createPrismaClient expects a postgres URL string. Got: ${typeof connectionString}`,
        );
    }
    const adapter = new PrismaPg({ connectionString: url });
    const prisma = new PrismaClient({ adapter }).$extends(withAccelerate());
    return prisma;
}

export type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

export function getConnectionString(): string {
    const value = "postgresql://postgres:postgres@127.0.0.1:5432/database?schema=public"

    if (!value) {
        throw new Error("DATABASE_URL is not set");
    }

    if (typeof value !== "string") {
        throw new Error(`DATABASE_URL must be string. Got ${typeof value}`);
    }

    const url = value.trim();

    if (!url.startsWith("postgres")) {
        throw new Error(`Invalid DATABASE_URL: ${url}`);
    }

    return url;
}

const globalForPrisma = globalThis as unknown as { prisma: ExtendedPrismaClient };

function createPrisma(): ExtendedPrismaClient {
    return createPrismaClient(getConnectionString());
}

export const prisma =
    globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
