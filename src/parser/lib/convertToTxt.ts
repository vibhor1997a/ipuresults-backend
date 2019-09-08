import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../../helpers/response';
import { S3 } from 'aws-sdk';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../../config/db';
import { ResultFile } from '../../../interfaces/resultFile';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
// const readFilePromise = promisify(fs.readFile);
// const writeFilePromise = promisify(fs.writeFile);
// const chmodPromise = promisify(fs.chmod);

const s3Client = new S3();
let conn: Connection;

export async function convertToTxt(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];
    console.log(process.env.LAMBDA_TASK_ROOT);
    process.env.PATH = process.env.PATH + ':' + '/opt/pdftotext/bin';
    process.env.LD_LIBRARY_PATH = process.env.LD_LIBRARY_PATH + ':' + '/opt/pdftotext/lib';
    try {
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        let resultFile = await ResultFile.findOne({ isDownloaded: true, isConverted: false, toSkip: false });
        if (!resultFile) {
            return APIResponse({ message: 'no upload needed' });
        }
        let resultFileIdStr = resultFile._id.toHexString();

        try {
            console.log("started pdf fetching");
            await getPdfFile(resultFileIdStr);
            console.log("ended pdf fetching");

            console.log("started pdf conversion");
            await convertPdfFile(resultFileIdStr);
            console.log("ended pdf conversion");

            console.log("started txt upload");
            await uploadTxtFile(resultFileIdStr);
            console.log("ended pdf upload");
        }
        catch (err) {
            resultFile.toSkip = true;
            resultFile = await resultFile.save();
            throw err;
        }

        resultFile.isConverted = true;
        resultFile = await resultFile.save();

        return APIResponse({ message: `result pdf ${resultFileIdStr} converted to txt` });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}

function getPdfFile(fileKey) {
    return new Promise((res, rej) => {
        let writeStream = fs.createWriteStream(`/tmp/${fileKey}.pdf`)
        let s3Stream = s3Client.getObject({
            Bucket: process.env.BUCKET_NAME,
            Key: `pdfs/${fileKey}`
        }).createReadStream();
        s3Stream.on('error', err => {
            console.log(err);
            rej(new Error("Couldn't fetch the pdf file"))
        });
        s3Stream.pipe(writeStream).on('close', () => {
            res();
        });
    });
}

async function convertPdfFile(fileKey): Promise<void> {
    try {
        // const pdfToTextBinary = await readFilePromise('/opt/pdftotext/bin/pdftotext');
        // await writeFilePromise('/tmp/pdftotext', pdfToTextBinary);
        // await chmodPromise('/tmp/pdftotext', 755);
        // await execPromise(`/tmp/pdftotext -raw /tmp/${fileKey}.pdf /tmp/${fileKey}.txt`)
        await execPromise(`pdftotext -raw /tmp/${fileKey}.pdf /tmp/${fileKey}.txt`);
        return;
    }
    catch (err) {
        console.log(err);
        throw new Error("Couldn't convert the file");
    }
}

function uploadTxtFile(fileKey) {
    let fileReadStream = fs.createReadStream(`/tmp/${fileKey}.txt`);
    return s3Client.putObject({
        Bucket: process.env.BUCKET_NAME,
        Key: `txts/${fileKey}`,
        Body: fileReadStream,
        ContentType: 'text/plain'
    }).promise();
}