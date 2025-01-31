import { serve } from '@hono/node-server';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import app from '.';
import { showRoutes } from 'hono/dev';

async function startServer() {
    try {
        const port = config.services.events.port;
        serve({
            fetch: app.fetch,
            port
        });

		showRoutes(app)

        logger.info(`Events service is running on port ${port}`);
    } catch (error) {
        logger.error('Failed to start events service:', error);
        process.exit(1);
    }
}

startServer();
