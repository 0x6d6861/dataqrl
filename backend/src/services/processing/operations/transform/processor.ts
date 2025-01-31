import { FileStatus, FileUploadedEvent, ProcessingResult } from "@/types";
import { publishEvent } from "@/utils/events";
import { logger } from "@/utils/logger";
import { processCsvFile } from "../load/csv";
import { processExcelFile } from "../load/xls";
import { processJsonFile } from "../load/json";
import { filesRepository } from "@/repository/files";

export async function processFile(event: FileUploadedEvent) {
    const { fileId, path } = event;

    try {
        // Get file and update status
        const file = await filesRepository.getById(fileId);


		await filesRepository.update(fileId, { status: FileStatus.PROCESSING });

        // Emit processing started event
        await publishEvent('FILE_PROCESSING', {
            fileId,
            status: 'STARTED',
            progress: 0
        });

        // Process based on mime type
        let processingResult: ProcessingResult;

        switch (file.mimeType) {
            case 'text/csv':
                processingResult = await processCsvFile(path, fileId);
                break;
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            case 'application/vnd.ms-excel':
                processingResult = await processExcelFile(path);
                break;
            case 'application/json':
                processingResult = await processJsonFile(path);
                break;
            default:
                processingResult = {
                    success: false,
                    error: 'Unsupported file type'
                };
        }

		const updateValues: {
			processedData?: Partial<ProcessingResult>;
			status?: FileStatus;
			processingError?: string;
		} = {}

        if (processingResult.success) {
			updateValues.processedData = {
                data: processingResult.data,
                schema: processingResult.schema,
                summary: processingResult.summary
            };
			updateValues.status = FileStatus.COMPLETED;
        } else {
			updateValues.status = FileStatus.ERROR;
			updateValues.processingError = processingResult.error;
        }

        await filesRepository.update(fileId, updateValues);

        await publishEvent('FILE_PROCESSED', {
            fileId,
            result: {
				...processingResult,
				schema: undefined,
				data: undefined
			}
        });

    } catch (error) {
        logger.error('Processing error:', error);
		console.error(error);
        const file = await filesRepository.getById(fileId);
        if (file) {
			await filesRepository.update(fileId, {
				status: FileStatus.ERROR,
				processingError: error.message
			});
        }

        await publishEvent('FILE_ERROR', {
            fileId,
            error: error.message
        });
    }
}
