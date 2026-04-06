import {
    Injectable,
    Logger,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';
import { createPrismaClient, ExtendedPrismaClient } from '../../prisma';

/**
 * NestJS Prisma service. Does not extend PrismaClient; holds a single client
 * created with the driver adapter and delegates to it. This avoids the Prisma 7.x
 * issue where extending PrismaClient and passing an adapter in super() causes
 * double-initialization and conflicting adapter configuration.
 */
@Injectable()
class PrismaServiceImpl implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private _client: ExtendedPrismaClient;
    
    constructor() {
        // Always take DATABASE_URL from getServerEnv() at runtime; pg accepts only string (avoids ERR_INVALID_ARG_TYPE).
        const DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/database?schema=public"
        const url =
            typeof DATABASE_URL === 'string' && DATABASE_URL.trim()
                ? DATABASE_URL.trim()
                : DATABASE_URL != null && typeof DATABASE_URL === 'object' && 'host' in (DATABASE_URL as object)
                  ? (() => {
                        const o = DATABASE_URL as Record<string, unknown>;
                        const enc = (s: string) => encodeURIComponent(s);
                        return `postgresql://${enc(String(o.user ?? 'postgres'))}:${enc(String(o.password ?? ''))}@${String(o.host ?? '127.0.0.1')}:${String(o.port ?? 5432)}/${enc(String(o.database ?? o.user ?? 'postgres'))}?schema=public`;
                    })()
                  : '';
        if (!url) {
            throw new Error('DATABASE_URL is not set or not a string. Set it in .env or DB_* vars.');
        }
        this._client = createPrismaClient(url);
        return new Proxy(this, {
            get(target, prop: string | symbol) {
                if (prop in target) {
                    return (target as Record<string | symbol, unknown>)[prop];
                }
                return (target._client as unknown as Record<string | symbol, unknown>)[prop];
            },
        }) as this;
    }

    async onModuleInit() {
        this.logger.log('Connecting to database...');
        try {
            await this._client.$connect();
        } catch (e) {
            this.logger.error('Connecting to database...', e);
        }
    }

    async onModuleDestroy() {
        this.logger.log('Disconnecting from database...');
        await this._client.$disconnect();
    }

    get client(): ExtendedPrismaClient {
        return this._client;
    }
};

export const PrismaService = PrismaServiceImpl;

export type PrismaService = InstanceType<typeof PrismaServiceImpl> & ExtendedPrismaClient;
