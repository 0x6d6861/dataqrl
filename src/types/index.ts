// src/types/index.ts

export enum FileStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    ERROR = 'ERROR'
}

export interface FileMetadata {
    originalName: string;
    mimeType: string;
    size: number;
    status: FileStatus;
    path: string;
    processingError?: string;
}

export interface ProcessingResult {
    success: boolean;
    error?: string;
    data?: any[];
    schema?: Record<string, any>;
    summary?: {
        rowCount: number;
        columns: Record<string, any>;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface UploadResponse {
    fileId: string;
    status: FileStatus;
}

export interface FileUploadedEvent {
    fileId: string;
    path: string;
    metadata: FileMetadata;
}

export interface FileProcessedEvent {
    fileId: string;
    result: ProcessingResult;
}

export interface FileProcessingEvent {
    fileId: string;
    status: string;
    progress: number;
    currentLine?: number;
    totalLines?: number;
}

export interface FileErrorEvent {
    fileId: string;
    error: string;
}

export interface FileDocument {
    _id: string;
    originalName: string;
    mimeType: string;
    size: number;
    status: FileStatus;
    path: string;
    processingError?: string;
    metadata: Record<string, any>;
    processedData?: {
        data: any[];
        schema: Record<string, any>;
        summary: {
            rowCount: number;
            columns: Record<string, any>;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}