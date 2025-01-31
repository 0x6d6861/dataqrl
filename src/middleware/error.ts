import { Context, Next } from 'hono';
import { logger } from '@/utils/logger';
import { getRedisClient } from '@/utils/redis';

export async function errorHandler(c: Context, next: Next) {
    try {
        await next();
    } catch (error) {
        logger.error('Unhandled error:', error);

        if (error instanceof Error) {
            return c.json({
                success: false,
                error: process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : error.message
            }, 500);
        }

        return c.json({
            success: false,
            error: 'Unknown error occurred'
        }, 500);
    }
}

export async function validateRequest(schema: any) {
    return async (c: Context, next: Next) => {
        try {
            const body = await c.req.json();
            await schema.validateAsync(body);
            await next();
        } catch (error) {
            return c.json({
                success: false,
                error: error.message
            }, 400);
        }
    };
}

export async function rateLimit(limit: number, window: number) {
    return async (c: Context, next: Next) => {
        const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');
        const key = `ratelimit:${ip}`;

        const requests = await incrementRequestCount(key, window);

        if (requests > limit) {
            return c.json({
                success: false,
                error: 'Too many requests'
            }, 429);
        }

        await next();
    };
}


async function incrementRequestCount(key: string, window: number): Promise<number> {
    const redis = getRedisClient();

    const now = Date.now();
    const windowKey = `${key}:${Math.floor(now / (window * 1000))}`;

    const multi = redis.multi();
    multi.incr(windowKey);
    multi.expire(windowKey, window);

    const results = await multi.exec();

    return results[0][1] as number;
}
