import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../helpers/response';
import { S3 } from 'aws-sdk';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../config/db';
import { ResultFile } from '../../interfaces/resultFile';
import { parseContent } from './parser';
import { prepareForInsert, insertAllData } from './insert';
const s3Client = new S3();

let conn: Connection;

/**
 * Lambda to parse txt 1 by 1 and save data into the db
 * @param event 
 * @param context 
 */
export async function parseTxt(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const fileId = event.fileId;
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        let resultFile = await ResultFile.findById(fileId);
        if (!resultFile) {
            return APIResponse({ message: 'not found', statusCode: 404 });
        }
        let resultFileIdStr = resultFile._id.toHexString();
        const fileContent = await getTxt(resultFileIdStr);
        console.log(`parsing result ${resultFileIdStr}`);
        try {
            const { pages, subjects, institutions, programmes } = parseContent(fileContent);
            const prepared = prepareForInsert({ conn, subjectsMap: subjects, pages, takenFrom: resultFile._id, institutionsMap: institutions, programmesMap: programmes });
            await insertAllData(prepared);
        }
        catch (err) {
            resultFile.toSkip = true;
            resultFile = await resultFile.save();
            throw err;
        }
        resultFile.isParsed = true;
        resultFile = await resultFile.save();
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
    try {
        const s3Response = await s3Client.getObject({
            Key: `txts/${fileKey}`,
            Bucket: process.env.BUCKET_NAME
        }).promise();
        return s3Response.Body.toString();
    }
    catch (err) {
        console.error(err);
        throw new Error("Couldn't fetch the txt file");
    }
}