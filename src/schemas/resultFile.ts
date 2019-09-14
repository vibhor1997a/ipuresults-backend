import { Schema } from "mongoose";

export const resultFileSchema = new Schema({
    link: {
        type: String,
        required: true,
        unique: true
    },
    linkText: {
        type: String,
        required: true
    },
    isDownloaded: {
        type: Boolean,
        default: false
    },
    isConverted: {
        type: Boolean,
        default: false
    },
    isParsed: {
        type: Boolean,
        default: false
    },
    downloadedAt: Date,
    convertedAt: Date,
    parsedAt: Date,
    toSkip: {
        type: Boolean,
        default: false
    }
});