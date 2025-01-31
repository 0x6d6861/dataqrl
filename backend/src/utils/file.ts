import { config } from '@/config/index';
import fs from 'fs/promises';
import path from 'path';

export async function saveFile(buffer: Buffer, filePath: string): Promise<string> {
    const fullPath = path.join(config.upload.uploadDir, filePath);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    return fullPath;
}

export async function deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(config.upload.uploadDir, filePath);
    await fs.unlink(fullPath);
}

export async function validateFile(fileName: string, mimeType: string, size: number): Promise<{ valid: boolean; error?: string }> {
    if (!config.upload.allowedMimeTypes.includes(mimeType)) {
        return {
            valid: false,
            error: 'Unsupported file type'
        };
    }

    if (size > config.upload.maxFileSize) {
        return {
            valid: false,
            error: 'File too large'
        };
    }

    return { valid: true };
}

export const getFileContent = async (filePath: string): Promise<string> => {
	const fileContent = await fs.readFile(filePath, 'utf-8');
	return fileContent;
};
