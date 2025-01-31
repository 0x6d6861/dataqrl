import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from '@/utils/logger';
import { File } from '@/models/file';
import { subscribeToEvent } from '@/utils/events';
import { FileUploadedEvent } from '@/types';
import { processFile } from './operations/transform/processor';
import { filesRepository } from '@/repository/files';

const app = new Hono();

app.use('*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.get('/data/:fileId', async (c) => {
    try {
        const fileId = c.req.param('fileId');
        const file = await File.findById(fileId);

        if (!file) {
            return c.json({ success: false, error: 'Data not found' }, 404);
        }

        return c.json({
            success: true,
            data: {
                file: {
                    originalName: file.originalName,
                    mimeType: file.mimeType,
                    status: file.status,
                    createdAt: file.createdAt
                },
                processedData: file.processedData
            }
        });
    } catch (error) {
        console.error('Data retrieval error:', error);
        return c.json({ success: false, error: 'Failed to retrieve data' }, 500);
    }
});

// Endpoint to retry processing a file
app.post('/retry/:fileId', async (c) => {
    try {
        const fileId = c.req.param('fileId');
        const file = await filesRepository.getById(fileId);

        if (!file) {
            return c.json({ success: false, error: 'File not found' }, 404);
        }

        const retryEvent: FileUploadedEvent = {
            fileId: file._id,
			path: file.path,
            metadata: file.metadata
        };

        await processFile(retryEvent);

        return c.json({
            success: true,
            message: 'File processing retry initiated'
        });
    } catch (error) {
        logger.error('Retry processing error:', error);
        return c.json({
            success: false,
            error: 'Failed to retry file processing'
        }, 500);
    }
});

subscribeToEvent('FILE_UPLOADED', async (event: FileUploadedEvent) => {
    await processFile(event);
});

export default app;
