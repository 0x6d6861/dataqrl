import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { EventEmitter } from 'events';
import { logger } from '@/utils/logger';
import { getRedisClient } from '@/utils/redis';

const app = new Hono();
const emitter = new EventEmitter();

app.use('/*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

const channels = ['FILE_UPLOADED', 'FILE_PROCESSING', 'FILE_PROCESSED', 'FILE_ERROR'];
const subscriber = getRedisClient()

subscriber.subscribe(...channels, (err) => {
    if (err) {
        logger.error('Redis subscription error:', err);
    }
});

subscriber.on('message', (channel, message) => {
    try {
        const data = JSON.parse(message);
        emitter.emit(data.fileId, { type: channel, data });

        emitter.emit('all', { type: channel, data });

	} catch (error) {
        logger.error('Error handling Redis message:', error);
    }
});

app.get('/events/:fileId', async (c) => {
    const fileId = c.req.param('fileId');

    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const listener = (event: any) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        writer.write(new TextEncoder().encode(data));
    };

    emitter.on(fileId, listener);

    c.req.raw.signal.addEventListener('abort', () => {
        emitter.removeListener(fileId, listener);
        writer.close();
    });

    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
});

app.get('/events', async (c) => {
    c.header('Content-Type', 'text/event-stream');
    c.header('Cache-Control', 'no-cache');
    c.header('Connection', 'keep-alive');

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const listener = (event: any) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        writer.write(new TextEncoder().encode(data));
    };

    emitter.on('all', listener);

    c.req.raw.signal.addEventListener('abort', () => {
        emitter.removeListener('all', listener);
        writer.close();
    });

    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
});

app.get('/connections/:fileId', async (c) => {
    const fileId = c.req.param('fileId');
    const listenerCount = emitter.listenerCount(fileId);

    return c.json({
        success: true,
        data: {
            fileId,
            connections: listenerCount
        }
    });
});

app.get('/connections', async (c) => {
    const globalListeners = emitter.listenerCount('all');
    const fileListeners = channels.reduce((acc, channel) => acc + emitter.listenerCount(channel), 0);

    return c.json({
        success: true,
        data: {
            globalConnections: globalListeners,
            fileConnections: fileListeners
        }
    });
});

export default app;
