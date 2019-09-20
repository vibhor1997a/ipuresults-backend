import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { InternalServerError, APIResponse } from "../helpers/response";
import { Connection, Model } from "mongoose";
import { connectToDB } from "../config/db";
import { getSemesterScores } from "./getSemesterScores";
import { ObjectId } from "bson";
import { InstitutionModel } from "../interfaces/institution";

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
        const rankType: 'institution' | 'university' = event.queryStringParameters['type'] as any;
        const takenFrom: string = event.queryStringParameters['fileId'];
        const institutionCode: string = event.queryStringParameters['institutionCode'];
        let institutionCodes: string[];
        if (rankType == 'institution') {
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
                message: 'Invalid rankType',
                statusCode: 400
            });
        }
        if (!takenFrom) {
            return APIResponse({
                message: 'fileId is required',
                statusCode: 400
            });
        }
        let semesterScores = await getSemesterScores({ conn, institutionCodes, takenFrom: new ObjectId(takenFrom) });
        const rankList = [];
        let rank = 1, prevMarks;
        for (let i = 0; i < semesterScores.length; i++) {
            if (i != 0 && prevMarks != semesterScores[i].marks) {
                rank++;
            }
            prevMarks = semesterScores[i].marks;
            rankList.push({
                rollNumber: semesterScores[i].rollNumber,
                name: semesterScores[i].name,
                rank,
                marks: semesterScores[i].marks
            });
        }
        return APIResponse({
            data: rankList
        });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}
