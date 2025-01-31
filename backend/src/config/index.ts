import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
    mongodb: {
        uri: process.env.MONGODB_URI,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },
    redis: {
        url: process.env.REDIS_URL
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB
        allowedMimeTypes: [
            'text/csv',
            'application/json',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')
    },
    services: {
        upload: {
            port: parseInt(process.env.UPLOAD_SERVICE_PORT || '3000', 10)
        },
        processing: {
            port: parseInt(process.env.PROCESSING_SERVICE_PORT || '3001', 10)
        },
        events: {
            port: parseInt(process.env.EVENTS_SERVICE_PORT || '3002', 10)
        }
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    }
};
