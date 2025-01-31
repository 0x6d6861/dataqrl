import mongoose from 'mongoose';

export const FileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'ERROR'],
        default: 'PENDING'
    },
    path: {
        type: String,
        required: false
    },
    processingError: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    processedData: {
        data: [mongoose.Schema.Types.Mixed],
        schema: mongoose.Schema.Types.Mixed,
        summary: {
            rowCount: Number,
            columns: mongoose.Schema.Types.Mixed
        }
    }
}, {
    timestamps: true
});

FileSchema.index({ status: 1 });
FileSchema.index({ createdAt: 1 });
FileSchema.index({ "processedData.schema": 1 });

FileSchema.methods.updateProcessingStatus = async function (status: string, error?: string) {
    this.status = status;
    if (error) this.processingError = error;
    return this.save();
};

export const File = mongoose.model('File', FileSchema);
