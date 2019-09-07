import * as http from 'http';
// import * as https from 'https';
import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../helpers/response';
import { S3, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../config/db';
import { ResultFile } from '../../interfaces/resultFile';

let conn: Connection;

export async function downloadPdf(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        let resultFile = await ResultFile.findOne({ isDownloaded: false });
        if (!resultFile) {
            return APIResponse({ message: 'no upload needed' });
        }
        let requestURL = encodeURI(resultFile.link);
        let resultFileIdStr = resultFile._id.toHexString();
        let uploadRequest = await downloadAndUploadStuff(requestURL, resultFileIdStr);
        console.log(uploadRequest);
        resultFile.isDownloaded = true;
        resultFile = await resultFile.save();
        return APIResponse({ message: `result pdf ${resultFileIdStr} uploaded` });
    }
    catch (err) {
        console.log(err);
        return InternalServerError;
    }
}

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