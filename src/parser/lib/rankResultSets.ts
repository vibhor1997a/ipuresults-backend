import { Context, APIGatewayProxyResult } from 'aws-lambda';
import { InternalServerError, APIResponse } from '../../helpers/response';
import { Connection, Model } from 'mongoose';
import { connectToDB } from '../../config/db';
import { ResultFile } from '../../interfaces/resultFile';
import { ObjectId } from 'bson';
import { ResultSetModel } from '../../interfaces/result';
import { SemesterRank } from '../../interfaces/semesterRank';
import { bulkInsertAll } from '../../helpers/bulk';

let conn: Connection;

/**
 * Lambda to assign ranks to all eligible result sets in a result file
 * @param event 
 * @param context 
 */
export async function rankResultSets(event, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = false;
    try {
        const fileId = event.fileId;
        conn = await connectToDB(conn);
        const ResultFile: Model<ResultFile> = conn.model('ResultFile');
        let resultFile = await ResultFile.findById(fileId);
        if (!resultFile) {
            return APIResponse({ message: 'not found', statusCode: 404 });
        }
        const ResultSetModel: Model<ResultSetModel> = conn.model('ResultSet');
        console.log(`ranking ${fileId}`);
        let scores = await aggregateSemesterScores({ ResultSetModel, takenFrom: new ObjectId(fileId) });
        let universityRank = 1, prevMarks;
        let SemesterRankModel: Model<SemesterRank> = conn.model('SemesterRank');
        let semesterRanks: SemesterRank[] = [];
        let institutionNameScoresMap: {
            [institutionName: string]: any[]
        } = {};
        for (let i = 0; i < scores.length; i++) {
            let score = scores[i];
            if (i != 0 && prevMarks != score.marks) {
                universityRank++;
            }
            prevMarks = score.marks;
            score.universityRank = universityRank;
            if (!institutionNameScoresMap[score.institution.name]) {
                institutionNameScoresMap[score.institution.name] = [];
            }
            institutionNameScoresMap[score.institution.name].push(score);
        }

        for (let institutionName of Object.keys(institutionNameScoresMap)) {
            let institutionScores = institutionNameScoresMap[institutionName];
            institutionScores.sort((a, b) => b.marks - a.marks);
            prevMarks = undefined
            let collegeRank = 1;
            for (let i = 0; i < institutionScores.length; i++) {
                let institutionScore = institutionScores[i];
                if (i != 0 && prevMarks != institutionScore.marks) {
                    collegeRank++;
                }
                prevMarks = institutionScore.marks;
                semesterRanks.push(new SemesterRankModel({
                    rollNumber: institutionScore.rollNumber,
                    marks: institutionScore.marks,
                    takenFrom: institutionScore.takenFrom,
                    name: institutionScore.name,
                    institution: institutionScore.institution,
                    universityRank: institutionScore.universityRank,
                    collegeRank
                }));
            }
        }
        try {
            await bulkInsertAll(semesterRanks, SemesterRankModel);
        }
        catch (err) {
            resultFile.toSkip = true;
            await resultFile.save();
            throw err;
        }
        resultFile.isRanked = true;
        await resultFile.save();
        return APIResponse({
            message: `ranked ${fileId}`
        });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}
//5d749ed53828510008769676
async function aggregateSemesterScores({ ResultSetModel, takenFrom }: { ResultSetModel: Model<ResultSetModel>; takenFrom: ObjectId; }): Promise<any[]> {
    return ResultSetModel.aggregate([
        {
            '$match': {
                'exam.regularReappear': 'regular',
                'takenFrom': takenFrom
            }
        }, {
            '$unwind': {
                'path': '$subjects'
            }
        }, {
            '$group': {
                '_id': '$rollNumber',
                'marks': {
                    '$sum': '$subjects.totalMarks.score'
                },
                'takenFrom': {
                    '$first': '$takenFrom'
                },
                'institutionCode': {
                    '$first': '$institutionCode'
                }
            }
        }, {
            '$lookup': {
                'from': 'students',
                'localField': '_id',
                'foreignField': 'rollNumber',
                'as': 'students'
            }
        }, {
            '$lookup': {
                'from': 'institutions',
                'localField': 'institutionCode',
                'foreignField': 'code',
                'as': 'institutions'
            }
        }, {
            '$project': {
                'marks': 1,
                'takenFrom': '$takenFrom',
                'name': {
                    '$arrayElemAt': [
                        {
                            '$map': {
                                'input': '$students',
                                'as': 'student',
                                'in': '$$student.name'
                            }
                        }, 0
                    ]
                },
                'institution': {
                    'code': '$institutionCode',
                    'name': {
                        '$arrayElemAt': [
                            {
                                '$map': {
                                    'input': '$institutions',
                                    'as': 'institution',
                                    'in': '$$institution.name'
                                }
                            }, 0
                        ]
                    }
                },
                'rollNumber': '$_id',
                '_id': 0
            }
        }, {
            '$sort': {
                'marks': -1
            }
        }
    ]).allowDiskUse(true);
}