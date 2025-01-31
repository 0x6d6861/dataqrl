import { ProcessingResult } from "@/types";
import { generateSummaryStats } from '../analyse/summary';
import { getFileContent } from '@/utils/file';
import { generateJSONDataSchema } from "../extract/dataSchema";

function extractJsonSchema(obj: any, prefix = ''): Record<string, string> {
	const schema: Record<string, string> = {};

	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (value !== null && typeof value === 'object') {
			if (Array.isArray(value)) {
				schema[fullKey] = 'array';
				if (value.length > 0 && typeof value[0] === 'object') {
					Object.assign(schema, extractJsonSchema(value[0], fullKey + '[]'));
				}
			} else {
				schema[fullKey] = 'object';
				Object.assign(schema, extractJsonSchema(value, fullKey));
			}
		} else {
			schema[fullKey] = typeof value;
		}
	}

	return schema;
}

export async function processJsonFile(path: string): Promise<ProcessingResult> {
    try {
        const fileContent = await getFileContent(path);
        const data = JSON.parse(fileContent);

        // Handle both array and object data
        const processedData = Array.isArray(data) ? data : [data];

        // Extract schema from first item
        const schema = processedData[0] ?
			generateJSONDataSchema(processedData[0]) : {};

        // Calculate summary statistics
        const summary = generateSummaryStats(processedData);

        return {
            success: true,
            data: processedData,
            schema,
            summary
        };
    } catch (error) {
        return {
            success: false,
            error: 'JSON processing failed'
        };
    }
}
