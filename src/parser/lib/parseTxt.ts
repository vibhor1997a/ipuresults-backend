import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../../helpers/response';
import { S3 } from 'aws-sdk';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../config/db';
import { ResultFile } from '../../interfaces/resultFile';
import * as moment from 'moment';
import { parseContent } from './parser';

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
        let resultFile = await ResultFile.findOne({
            isDownloaded: true,
            isConverted: true,
            toSkip: false,
            // skipping these
            linkText: /^((?!bams).)*$/i
        });
        if (!resultFile) {
            return APIResponse({ message: 'no upload needed' });
        }
        let resultFileIdStr = resultFile._id.toHexString();
        const fileContent = await getTxt(resultFileIdStr);
        const pages = parseContent(fileContent);
        const s3Client = new S3();
        const req = await s3Client.putObject({
            Bucket: process.env.Bucket_NAME,
            Key: `jsons/result-${resultFileIdStr}.json`,
            Body: JSON.stringify(pages, undefined, 4)
        }).promise();
        return APIResponse({ message: 'result parsed' });
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