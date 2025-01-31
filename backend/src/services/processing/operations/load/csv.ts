import { ProcessingResult } from '@/types';
import Papa from 'papaparse';
import { generateSummaryStats } from '../analyse/summary';
import { getFileContent } from '@/utils/file';
import { generateJSONDataSchema } from '../extract/dataSchema';

export async function processCsvFile(path: string, fileId: string): Promise<ProcessingResult> {
    try {
        const fileContent = await getFileContent(path);

        return new Promise((resolve, reject) => {
            Papa.parse(fileContent, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
				// chunk: (results, parser) => {
				// 	console.log("results chunk", results)
				// },
                // step: async (results, parser) => {
                //     if (results.data && results.meta.cursor % 1000 === 0) {
                //         const progress = Math.floor((results.meta.cursor / fileContent.length) * 100);
                //         await publishEvent('FILE_PROCESSING', {
                //             fileId,
                //             status: 'PROCESSING',
                //             progress,
                //             currentLine: results.meta.cursor
                //         });
                //     }
                // },
                complete: (results, file) => {

					const schema = results.data[0] ? generateJSONDataSchema(results.data[0]) : {};

                    // Calculate summary statistics
                    const summary = generateSummaryStats(results.data);

                    resolve({
                        success: true,
                        data: results.data,
                        schema,
                        summary
                    });
                },
                error: (error) => {
                    reject({ success: false, error: error.message });
                }
            });
        });
    } catch (error) {

		console.error(error)

        return {
            success: false,
            error: 'CSV processing failed'
        };
    }
}
