export function generateSummaryStats(data: Record<string, any>[]): Record<string, any> {
    const summary: Record<string, any> = {
        rowCount: data.length,
        columns: {}
    };

    if (data.length === 0) return summary;

    // Analyze each column
    Object.keys(data[0]).forEach(column => {
        const values = data.map(row => row[column]).filter(val => val != null);
        const valueType = typeof values[0];

        const columnSummary: any = {
            type: valueType,
            nullCount: data.length - values.length,
            uniqueCount: new Set(values).size
        };

        if (valueType === 'number') {
            columnSummary.min = Math.min(...values);
            columnSummary.max = Math.max(...values);
            columnSummary.avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            columnSummary.sum = values.reduce((sum, val) => sum + val, 0);
        } else if (valueType === 'string') {
            columnSummary.minLength = Math.min(...values.map(str => str.length));
            columnSummary.maxLength = Math.max(...values.map(str => str.length));
            columnSummary.empty = values.filter(str => {
				return !str;
			}).length;
        } else if (valueType === 'boolean') {
            columnSummary.trueCount = values.filter(val => val === true).length;
            columnSummary.falseCount = values.filter(val => val === false).length;
        }

        summary.columns[column] = columnSummary;
    });

    return summary;
}
