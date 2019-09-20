import { ResultSetModel } from "../interfaces/result";
import { ObjectId } from "bson";
import { Model, Connection } from "mongoose";
import { SemesterScore } from "../interfaces/semesterScore";

export async function getSemesterScores({ institutionCodes, conn, takenFrom }: { institutionCodes: string[]; conn: Connection; takenFrom: ObjectId; }): Promise<SemesterScore[]> {
    const ResultSetModel: Model<ResultSetModel> = conn.model('ResultSet');
    const SemesterScoreModel: Model<SemesterScore> = conn.model('SemesterScore');

    const query = institutionCodes && institutionCodes.length > 0 ? {
        institutionCode: {
            '$in': institutionCodes
        },
        takenFrom: takenFrom
    } : {
            takenFrom: takenFrom
        };

    let semesterScores = await SemesterScoreModel.find(query).sort({ marks: -1 });

    if (semesterScores.length == 0) {
        await aggregateSemesterScores({ ResultSetModel, takenFrom });
        semesterScores = await SemesterScoreModel.find(query).sort({ marks: -1 });
    }
    return semesterScores;
}

async function aggregateSemesterScores({ ResultSetModel, takenFrom }: { ResultSetModel: Model<ResultSetModel>; takenFrom: ObjectId; }): Promise<any> {
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
                'institutionCode': '$institutionCode',
                'rollNumber': '$_id',
                '_id': 0
            }
        },
        {
            '$merge': 'semesterscores'
        }
    ]);
}