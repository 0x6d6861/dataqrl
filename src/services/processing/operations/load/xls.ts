import { ProcessingResult } from '@/types';
import XLSX from 'xlsx';
import { generateSummaryStats } from '../analyse/summary';
import { getFileContent } from '@/utils/file';
import { generateJSONDataSchema } from '../extract/dataSchema';

export async function processExcelFile(path: string): Promise<ProcessingResult> {
    try {
        const fileBuffer = await getFileContent(path);
        const workbook = XLSX.read(fileBuffer, {
            type: 'buffer',
            cellDates: true
        });

        const results: Record<string, any>[] = [];
        const schemas: Record<string, any> = {};
        const summaries: Record<string, any> = {};

        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            if (data.length > 0) {
                // Extract schema from first row
				schemas[sheetName] = data[0] ? generateJSONDataSchema(data[0]): {};

                // Calculate summary statistics
                summaries[sheetName] = generateSummaryStats(data);

                results.push(...data);
            }
        });

        return {
            success: true,
            data: results,
            schema: schemas,
            summary: summaries
        };
    } catch (error) {
        return {
            success: false,
            error: 'Excel processing failed'
        };
    }
}
