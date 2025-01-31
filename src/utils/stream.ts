export async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
    const chunks = [];
    const reader = stream.getReader();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    return Buffer.concat(chunks);
}