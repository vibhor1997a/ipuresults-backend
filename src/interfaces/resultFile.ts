import { Document } from "mongoose";

export interface ResultFile extends Document {
    link: string;
    linkText: string;
    isDownloaded: boolean;
    isConverted: boolean;
    isParsed: boolean;
    downloadedAt: Date;
    convertedAt: Date;
    parsedAt: Date;
    toSkip: boolean;
    isRanked: boolean;
}