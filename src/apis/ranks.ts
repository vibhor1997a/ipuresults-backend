import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { InternalServerError, APIResponse } from "../helpers/response";
import { Connection, Model } from "mongoose";
import { connectToDB } from "../config/db";
import { ObjectId } from "bson";
import { InstitutionModel } from "../interfaces/institution";
import { SemesterRank } from "../interfaces/semesterRank";

let conn: Connection;

/**
 * calculate institution and university ranks 
 * @param event 
 * @param context 
 */
export async function getRanks(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = true;
    try {
        conn = await connectToDB(conn);
        const rankType: 'institution' | 'university' = event.pathParameters['type'] as any;
        const takenFrom: string = event.queryStringParameters['fileId'];
        const batch: string = event.queryStringParameters['batch'];
        const institutionCode: string = event.queryStringParameters['institutionCode'];
        const limit: number = Number(event.queryStringParameters['limit']) || 20;
        if (limit > 50) {
            return APIResponse({
                message: 'limit can\'t exceed 50',
                statusCode: 400
            });
        }
        const offset: number = Number(event.queryStringParameters['offset']) || 0;
        let institutionCodes: string[];
        const SemesterRankModel: Model<SemesterRank> = conn.model('SemesterRank');
        let query: any = {
            takenFrom: new ObjectId(takenFrom),
            batch
        };
        let sortFactor: any = { universityRank: 1 };
        if (rankType == 'institution') {
            sortFactor = { collegeRank: 1 };
            const InstitutionModel: Model<InstitutionModel> = conn.model('Institution');
            if (institutionCode) {
                const institution = await InstitutionModel.findOne({ code: institutionCode });
                if (!institution) {
                    return APIResponse({
                        message: 'Institution not found',
                        statusCode: 404
                    });
                }
                const institutions = await InstitutionModel.find({ name: institution.name });
                institutionCodes = institutions.map(institution => institution.code);
                query['institution.code'] = {
                    '$in': institutionCodes
                }
            }
            else {
                return APIResponse({
                    statusCode: 400,
                    message: 'insititutionCode is required for type institution'
                });
            }
        }
        else if (rankType != 'university') {
            return APIResponse({
                message: 'Invalid type',
                statusCode: 400
            });
        }
        if (!takenFrom) {
            return APIResponse({
                message: 'fileId is required',
                statusCode: 400
            });
        }
        const semesterRanks = await SemesterRankModel.find(query).sort(sortFactor).skip(offset).limit(limit);
        const rankList = semesterRanks.map(semesterRank => ({
            id: semesterRank._id,
            name: semesterRank.name,
            rollNumber: semesterRank.rollNumber,
            marks: semesterRank.marks,
            institution: {
                name: semesterRank.institution.name,
                code: semesterRank.institution.code,
            },
            collegeRank: semesterRank.collegeRank,
            universityRank: semesterRank.universityRank
        }));
        return APIResponse({
            data: rankList
        });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}