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

        const port = config.services.upload.port;
        serve({
            fetch: app.fetch,
            port
        });

		showRoutes(app, {
			verbose: false
		})

        logger.info(`Upload service is running on port ${port}`);
    } catch (error) {
		console.error(error)
        logger.error('Failed to start upload service:', error);
        process.exit(1);
    }
}

startServer();
