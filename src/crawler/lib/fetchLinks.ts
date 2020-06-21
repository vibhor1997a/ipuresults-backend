import * as request from 'request';
import * as cheerio from 'cheerio';
import * as url from 'url';
import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../helpers/response';
import { connectToDB } from '../../config/db';
import { Connection, Model } from 'mongoose';
import { ResultFile } from '../../interfaces/resultFile';

let conn: Connection;

/**
 * Fetch all the links and try to bulk insert into db
 * @param event 
 * @param context 
 */
export async function fetchLinks(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        const files = await ResultFile.find({}, { link: 1 });
        const currentLinks = files.map(files => files.link);
        const linkSet = new Set(currentLinks);
        console.log('fetching links');
        let resultFiles = await getResultFiles(process.env.START_URL, ResultFile, linkSet);
        console.log('fetched links');
        if (resultFiles.length > 0) {
            try {
                console.log('inserting links');

                await ResultFile.insertMany(resultFiles, { ordered: false });
                console.log('inserted links');
            }
            catch (err) {
                console.log(err);
            }
        }
        return APIResponse({ message: "Links Fetched into db" });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}

/**
 * Recursively fetch links from current page => next page and so on
 * @param reqLink 
 * @param ResultFile 
 * @param resultFiles 
 */
function getResultFiles(reqLink, ResultFile: Model<ResultFile>, linkSet: Set<string>, resultFiles?: ResultFile[]): Promise<ResultFile[]> {
    resultFiles = resultFiles || [];
    return new Promise((res, rej) => {
        request.get(reqLink, (err, response, body) => {
            if (err) {
                rej(err);
            }
            else {
                let $ = cheerio.load(body);
                $('tr>td a').each((i, el) => {
                    let $el = $(el);
                    let link = $el.attr('href');
                    let linkText = $el.text().trim() || "";
                    link = url.resolve(reqLink, link);
                    link = decodeURI(link);
                    let resultFile = new ResultFile({
                        link,
                        linkText
                    });
                    if (!linkSet.has(resultFile.link)) {
                        resultFiles.push(resultFile);
                    }
                });
                let $prevPage = $('tr>td>strong>a');
                if ($prevPage.length > 0) {
                    let prevPageLink = url.resolve(reqLink, $prevPage.attr('href'));
                    res(getResultFiles(prevPageLink, ResultFile, linkSet, resultFiles));
                }
                else {
                    res(resultFiles);
                }
            }
        });
    });
}