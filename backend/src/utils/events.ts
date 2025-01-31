import { logger } from './logger';
import { getRedisClient } from './redis';

const redis = getRedisClient();

export async function publishEvent(eventType: string, payload: any) {
    try {
		console.info("Publishing event", eventType, payload)
        await redis.publish(eventType, JSON.stringify(payload));
    } catch (error) {
		console.error(error)
        logger.error('Event publishing error:', error);
        throw error;
    }
}

export function subscribeToEvent(eventType: string, handler: (payload: any) => Promise<void>) {
    const subscriber = getRedisClient().duplicate();

	console.info("subscribeToEvent", eventType)

    subscriber.subscribe(eventType, (err) => {
        if (err) {
            logger.error(`Failed to subscribe to ${eventType}:`, err?.toString());
            return;
        }
    });

    subscriber.on('message', async (channel, message) => {
        if (channel === eventType) {
            try {
                const payload = JSON.parse(message);
                await handler(payload);
            } catch (error) {
                logger.error(`Error handling ${eventType} event:`, error);
            }
        }
    });

    return subscriber;
}
