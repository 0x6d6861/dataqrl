export const generateJSONDataSchema = (data: any): any => {
    const schema: any = {};
    for (const key in data) {
        if (typeof data[key] === 'string') {
            schema[key] = { type: 'string' };
        } else if (typeof data[key] === 'number') {
            schema[key] = { type: 'number' };
        } else if (typeof data[key] === 'boolean') {
            schema[key] = { type: 'boolean' };
        } else if (Array.isArray(data[key])) {
            schema[key] = { type: 'array' };
        } else if (typeof data[key] === 'object' && data[key] !== null) {
			schema[key] = generateJSONDataSchema(data[key]);
        }
    }
    return schema;
}
