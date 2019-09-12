import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../../helpers/response';
import { S3 } from 'aws-sdk';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../../config/db';
import { ResultFile } from '../../../interfaces/resultFile';
import * as moment from 'moment';
import { SemYear, ParsedResultPage, ParsedSchemePage } from '../../../interfaces/result';
import { Institution } from '../../../interfaces/institution';
import { RegexpStore } from './RegexpStore';

let conn: Connection;

/**
 * Lambda to parse txt 1 by 1 and save data into the db
 * @param event 
 * @param context 
 */
export async function parseTxt(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        let resultFile = await ResultFile.findOne({ isDownloaded: true, isConverted: true, toSkip: false });
        if (!resultFile) {
            return APIResponse({ message: 'no upload needed' });
        }
        let resultFileIdStr = resultFile._id.toHexString();
        const fileContent = await getTxt(resultFileIdStr);
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}

/**
 * fetch the txt file from the S3
 * @param fileKey 
 */
async function getTxt(fileKey): Promise<string> {
    const s3Client = new S3();
    try {
        const s3Response = await s3Client.getObject({
            Key: `txts/${fileKey}`,
            Bucket: process.env.Bucket_NAME
        }).promise();
        return s3Response.Body.toString();
    }
    catch (err) {
        console.error(err);
        throw new Error("Couldn't fetch the txt file");
    }
}