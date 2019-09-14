import * as http from 'http';
import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../../helpers/response';
import { S3, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../config/db';
import { ResultFile } from '../../interfaces/resultFile';

let conn: Connection;

/**
 * Lambda function to download pdf from result files in db one by one and save in S3
 * @param event 
 * @param context 
 */
export async function downloadPdf(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        let resultFile = await ResultFile.findOne({ isDownloaded: false, toSkip: false });
        if (!resultFile) {
            return APIResponse({ message: 'no upload needed' });
        }
        let requestURL = encodeURI(resultFile.link);
        let resultFileIdStr = resultFile._id.toHexString();
        console.log('downloading pdf');
        let uploadRequest;
        try {
            uploadRequest = await downloadAndUploadStuff(requestURL, resultFileIdStr);
        }
        catch (err) {
            resultFile.toSkip = true;
            resultFile = await resultFile.save();
            throw err;
        }
        console.log('downloaded pdf and uploaded to S3');
        console.log(uploadRequest);
        resultFile.isDownloaded = true;
        resultFile = await resultFile.save();
        return APIResponse({ message: `result pdf ${resultFileIdStr} uploaded` });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}

/**
 * Download the file at a given url and save in s3
 * @param requestURL 
 * @param s3Key 
 */
function downloadAndUploadStuff(requestURL, s3Key): Promise<PromiseResult<S3.PutObjectOutput, AWSError>> {
    return new Promise((res, rej) => {
        const s3Client = new S3();
        let requestObj = http.get(requestURL, response => {
            if (response.statusCode >= 300) {
                rej(new Error("Error fetching URL"));
            }
            else {
                let s3Request = s3Client.putObject({
                    Bucket: process.env.BUCKET_NAME,
                    Key: `pdfs/${s3Key}`,
                    Body: response,
                    ContentLength: Number(response.headers['content-length']),
                    ContentType: 'application/pdf'
                }).promise();
                s3Request
                    .then(req => res(req))
                    .catch(err => rej(err));
            }
        });
        requestObj.on('error', err => {
            rej(err);
        });
    });
}