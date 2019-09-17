import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { Connection, Model } from 'mongoose';
import { connectToDB } from './config/db';
import { ResultFile } from './interfaces/resultFile';
import { InternalServerError, APIResponse } from './helpers/response';
import { Lambda, AWSError } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
const lambda = new Lambda();

let conn: Connection;

/**
 * Triggered by cron to run every minute and execute the functions acc to requirement
 * @param event 
 * @param context 
 */
export async function executeScripts(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const downloadsPerMinute = Number(process.env.DOWNLOADS_PER_MINUTE);
        const convertsPerMinute = Number(process.env.CONVERTS_PER_MINUTE);
        const parsePerMinute = Number(process.env.PARSE_PER_MINUTE)
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        const toDownload = await ResultFile.find({
            isDownloaded: false,
            toSkip: false
        }).limit(downloadsPerMinute);
        const toConvert = await ResultFile.find({
            isDownloaded: true,
            isConverted: false,
            toSkip: false
        }).limit(convertsPerMinute);
        const toParse = await ResultFile.find({
            isDownloaded: true,
            isConverted: true,
            toSkip: false,
            isParsed: false
        }).limit(parsePerMinute);
        await invokeLambda('downloadPdf', toDownload);
        await invokeLambda('convertPdf', toConvert);
        await invokeLambda('parseTxt', toParse);
        return APIResponse({ data: 'started scripts execution successfully' });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}


async function invokeLambda(fname: string, files: ResultFile[]): Promise<PromiseResult<Lambda.InvocationResponse, AWSError>[]> {
    const arn = `${process.env.ARN_PREFIX}-${fname}`;
    const invokePromises: Promise<PromiseResult<Lambda.InvocationResponse, AWSError>>[] = [];
    for (const file of files) {
        let payload = JSON.stringify({ fileId: file._id.toHexString() });
        console.log(`Invoking ${fname} with fileId ${file._id}`);
        const invokePromise = lambda.invoke({ InvocationType: 'Event', FunctionName: arn, Payload: payload }).promise();
        invokePromises.push(invokePromise);
    }
    return Promise.all(invokePromises);
}