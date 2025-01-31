import { serve } from '@hono/node-server';
import mongoose from 'mongoose';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import app from '.';
import { showRoutes } from 'hono/dev';

async function startServer() {
    try {
        await mongoose.connect(config.mongodb.uri as string);
        logger.info('Connected to MongoDB');

        const port = config.services.processing.port;
        serve({
            fetch: app.fetch,
            port
        });

		showRoutes(app);
        logger.info(`Processing service is running on port ${port}`);
    } catch (error) {
        logger.error('Failed to start processing service:', error);
        process.exit(1);
    }
}

startServer();
