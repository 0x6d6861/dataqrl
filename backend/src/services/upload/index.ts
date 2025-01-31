import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { streamToBuffer } from '@/utils/stream';
import { deleteFile, saveFile, validateFile } from '@/utils/file';
import { publishEvent } from '@/utils/events';
import { logger } from '@/utils/logger';
import {File as NodeFile} from "node:buffer";
import { FileStatus, ApiResponse, UploadResponse } from '@/types';
import { filesRepository } from '@/repository/files';

const app = new Hono();

app.use('/*', cors());

app.get('/health', (c) => c.json({ status: 'ok' }));

app.post('/upload', async (c) => {
    try {
        const body = await c.req.parseBody();

        const file = body['file'] as NodeFile

        if (!file) {
            return c.json<ApiResponse>({
                success: false,
                error: 'No file provided'
            }, 400);
        }

        // Read file data
        const buffer = await streamToBuffer(file.stream());
        const fileName = file.name;
        const mimeType = file.type;
        const size = buffer.length;

        // Validate file
        const validation = await validateFile(fileName, mimeType, size);
        if (!validation.valid) {
            return c.json<ApiResponse>({
                success: false,
                error: validation.error
            }, 400);
        }

        // Create file document
        const fileDoc = await filesRepository.create({
            originalName: fileName,
            mimeType: mimeType,
            size: size,
            status: FileStatus.PENDING,
            path: '' // Will be updated after storage
        });

        // Store file in local storage
        const filePath = `${fileDoc._id}/${fileName}`;
        const path =  await saveFile(buffer, filePath);

		await filesRepository.update(fileDoc._id.toString(), {
			path: path
		});

        // Publish event for processing
        await publishEvent('FILE_UPLOADED', {
            fileId: fileDoc._id.toString(),
            path: path,
            metadata: {
                originalName: fileDoc.originalName,
                mimeType: fileDoc.mimeType,
                size: fileDoc.size
            }
        });

        logger.info(`File uploaded successfully: ${fileDoc._id}`);

        return c.json<ApiResponse<UploadResponse>>({
            success: true,
            data: {
                fileId: fileDoc._id.toString(),
                status: FileStatus.PENDING
            }
        });

    } catch (error) {
        console.error('Upload error:', error?.toString());
        return c.json<ApiResponse>({
            success: false,
            error: 'Upload failed'
        }, 500);
    }
});

app.get('/status/:fileId', async (c) => {
    try {
        const fileId = c.req.param('fileId');
        const file = await filesRepository.getById(fileId);

        if (!file) {
            return c.json<ApiResponse>({
                success: false,
                error: 'File not found'
            }, 404);
        }

        return c.json<ApiResponse>({
            success: true,
            data: {
                id: file._id,
                originalName: file.originalName,
                status: file.status,
                processingError: file.processingError,
                createdAt: file.createdAt,
                updatedAt: file.updatedAt
            }
        });

    } catch (error) {
        logger.error('Status check error:', error);
        return c.json<ApiResponse>({
            success: false,
            error: 'Failed to get file status'
        }, 500);
    }
});

app.get('/files', async (c) => {
    try {
        const page = parseInt(c.req.query('page') || '1');
        const limit = parseInt(c.req.query('limit') || '10');
        const status = c.req.query('status');

        const query = status ? { status } : {};

        const {files, total} = await filesRepository.findAll(query, page, limit);


        return c.json<ApiResponse>({
            success: true,
            data: {
                files,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });

    } catch (error) {
        logger.error('List files error:', error);
        return c.json<ApiResponse>({
            success: false,
            error: 'Failed to list files'
        }, 500);
    }
});

app.delete('/files/all', async (c) => {

	const data = await filesRepository.deleteAll()

	return c.json<ApiResponse>({
		success: true,
		data: data
	}, 200);
})

app.delete('/files/:fileId', async (c) => {
    try {
        const fileId = c.req.param('fileId');
        const file = await filesRepository.delete(fileId);

        if (!file) {
            return c.json<ApiResponse>({
                success: false,
                error: 'File not found'
            }, 404);
        }

        try {
            await deleteFile(file.path!);
        } catch (error) {
            logger.error(`Failed to delete physical file: ${file.path}`, error);
        }

        return c.json<ApiResponse>({
            success: true,
            data: { message: 'File deleted successfully' }
        });

    } catch (error) {
        logger.error('Delete file error:', error);
        return c.json<ApiResponse>({
            success: false,
            error: 'Failed to delete file'
        }, 500);
    }
});

app.get('/files/:fileId', async (c) => {
	try {
		const fileId = c.req.param('fileId');
		const file = await filesRepository.getById(fileId);

		if (!file) {
			return c.json<ApiResponse>({
				success: false,
				error: 'File not found'
			}, 404);
		}

		return c.json<ApiResponse>({
			success: true,
			data: { file }
		});

	} catch (error) {
		logger.error('Delete file error:', error);
		return c.json<ApiResponse>({
			success: false,
			error: 'Failed to delete file'
		}, 500);
	}
});

app.get('/files/:fileId/data', async (c) => {

	const page = parseInt(c.req.query('page') || '1');
	const limit = parseInt(c.req.query('limit') || '10');


	const query = c.req.query('query') ? JSON.parse(c.req.query('query') || '{}') : null;
	const sort = c.req.query('sort') ? JSON.parse(c.req.query('sort') || '{}') : null;

	console.log('Query:', query);
	console.log('Sort:', sort);



	try {
		const fileId = c.req.param('fileId');
		const file = await filesRepository.searchFileData(fileId, {
			query,
			sort
		}, page, limit);

		if (!file) {
			return c.json<ApiResponse>({
				success: false,
				error: 'File not found'
			}, 404);
		}

		return c.json<ApiResponse>({
			success: true,
			data: { file }
		});

	} catch (error) {
		console.error('No Data:', error);
		return c.json<ApiResponse>({
			success: false,
			error: 'Error occured'
		}, 500);
	}
});




export default app;
