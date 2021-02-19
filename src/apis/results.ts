import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { InternalServerError, APIResponse } from "../helpers/response";
import { Connection, Model } from "mongoose";
import { connectToDB } from "../config/db";
import { StudentModel } from "../interfaces/student";
import { ResultSetModel, ResponseSemesterResult, ResponseResult } from "../interfaces/result";
import { InstitutionModel } from "../interfaces/institution";
import { ProgrammeModel } from "../interfaces/programme";
import { SubjectModel } from "../interfaces/subject";
import { ObjectId } from "bson";
import { SemesterRank } from "../interfaces/semesterRank";
import * as crypto from 'crypto';

let conn: Connection;

/**
 * Get the result from db :)
 * @param event 
 * @param context 
 */
export async function getResult(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
    context.callbackWaitsForEmptyEventLoop = true;
    try {
        conn = await connectToDB(conn);
        const StudentModel: Model<StudentModel> = conn.model('Student');
        const ResultSetModel: Model<ResultSetModel> = conn.model('ResultSet');
        const SubjectModel: Model<SubjectModel> = conn.model('Subject');
        const ProgrammeModel: Model<ProgrammeModel> = conn.model('Programme');
        const InstitutionModel: Model<InstitutionModel> = conn.model('Institution');
        const SemesterRankModel: Model<SemesterRank> = conn.model('SemesterRank');
        const rollNumber = event.pathParameters['rollNumber'];
        const rollNumberMatchArr = rollNumber.match(/^\d{3,3}(\d{3,3})(\d{3,3})\d{2,2}$/);
        if (!rollNumberMatchArr) {
            return APIResponse({
                statusCode: 400,
                message: 'Invalid rollNumber'
            });
        }
        const [institutionCode, programmeCode] = [rollNumberMatchArr[1], rollNumberMatchArr[2]];
        const student = await StudentModel.findOne({ rollNumber });
        if (!student) {
            return APIResponse({
                statusCode: 404,
                message: 'result not found'
            });
        }
        const institution = await InstitutionModel.findOne({ code: institutionCode });
        const programme = await ProgrammeModel.findOne({ code: student.programmeCode });
        const resultSets = await ResultSetModel.find({
            rollNumber,
            programmeCode,
            institutionCode
        }).sort({
            "semYear.num": -1,
            declaredDate: -1
        });
        let subjectIds = [];
        for (let resultSet of resultSets) {
            subjectIds = subjectIds.concat(resultSet.subjects.map(subject => Number(subject.paperId) + ''));
            subjectIds = subjectIds.concat(resultSet.subjects.map(subject => subject.paperId));
        }
        const subjects = await SubjectModel.find({ paperId: { $in: subjectIds }, schemeId: student.schemeId });
        let paperIdSubjectMap: {
            [paperId: string]: SubjectModel
        } = {};
        for (let subject of subjects) {
            paperIdSubjectMap[subject.paperId] = subject;
        }

        let results: ResponseSemesterResult[] = [];
        let totalMarks = 0, maxMarks = 0, totalCredits = 0, maxCredits = 0, totalCreditMarks = 0, maxCreditMarks = 0;
        let rankPromises: Promise<SemesterRank>[] = [];
        let hashMapResultSets: {
            [hash: string]: ResultSetModel
        } = {};

        for (let resultSet of resultSets) {
            let hash = crypto.createHash('md5').update(`${resultSet.takenFrom}-${resultSet.exam.regularReappear}-${resultSet.exam.special}-${resultSet.semYear.num}`).digest('hex');
            hashMapResultSets[hash] = resultSet;
        }

        for (let resultSet of Object.values(hashMapResultSets)) {
            const isRegular = resultSet.exam.regularReappear == 'regular' && !resultSet.exam.special;
            const semResult: ResponseSemesterResult = {
                exam: {
                    date: resultSet.exam.date,
                    regularReappear: resultSet.exam.regularReappear,
                    special: resultSet.exam.special
                },
                prepared: resultSet.declaredDate,
                declared: resultSet.declaredDate,
                semYear: {
                    num: resultSet.semYear.num,
                    type: resultSet.semYear.type
                },
                creditsEarned: resultSet.totalCredits,
                subjects: [],
                fileId: resultSet.takenFrom.toHexString()
            };
            rankPromises.push(getRank(SemesterRankModel, rollNumber, resultSet.takenFrom));
            let totalSemMarks = 0, maxSemMarks = 0, totalSemCreditMarks = 0, maxSemCreditMarks = 0, maxSemCredits = 0;
            for (let subjectResult of resultSet.subjects) {
                let subject = paperIdSubjectMap[subjectResult.paperId];
                if (!subject) {
                    subject = paperIdSubjectMap[Number(subjectResult.paperId) + ''];
                }
                let isPassed = subjectResult.totalMarks.score >= subject.passMarks;
                semResult.subjects.push({
                    name: subject.name,
                    minor: {
                        max: subject.minor,
                        earned: subjectResult.minor.isSpecial ? subjectResult.minor.specialString : subjectResult.minor.score
                    },
                    major: {
                        max: subject.major,
                        earned: subjectResult.major.isSpecial ? subjectResult.major.specialString : subjectResult.major.score
                    },
                    total: {
                        max: subject.maxMarks,
                        earned: subjectResult.totalMarks.isSpecial ? subjectResult.totalMarks.specialString : subjectResult.totalMarks.score
                    },
                    isPassed,
                    credits: subject.credits
                });
                if (isRegular) {
                    maxSemCredits += subject.credits;
                    totalSemMarks += subjectResult.totalMarks.score;
                    maxSemMarks += subject.maxMarks;
                    totalSemCreditMarks += isPassed ? (subject.credits * subjectResult.totalMarks.score) : 0;
                    maxSemCreditMarks += subject.maxMarks * subject.credits;
                }
            }
            totalCredits += semResult.creditsEarned;
            if (isRegular) {
                totalMarks += totalSemMarks;
                maxMarks += maxSemMarks;
                maxCredits += maxSemCredits;
                totalCreditMarks += totalSemCreditMarks;
                maxCreditMarks += maxSemCreditMarks;
                semResult.percentage = Math.round((totalSemMarks / maxSemMarks) * 10000) / 100;
                semResult.maxMarks = maxSemMarks;
                semResult.totalMarks = totalSemMarks;
                semResult.creditPercentage = Math.round((totalSemCreditMarks / maxSemCreditMarks) * 10000) / 100;
            }
            results.push(semResult);
        }

        let ranks = await Promise.all(rankPromises);
        let ranksMap = {};
        for (let rank of ranks) {
            if (rank) {
                ranksMap[rank.takenFrom.toHexString()] = {
                    collegeRank: rank.collegeRank,
                    universityRank: rank.universityRank
                };
            }
        }

        for (let result of results) {
            result.collegeRank = ranksMap[result.fileId] && ranksMap[result.fileId].collegeRank
            result.universityRank = ranksMap[result.fileId] && ranksMap[result.fileId].universityRank
        }

        const data: ResponseResult = {
            rollNumber: student.rollNumber,
            programme: {
                code: programme.code,
                name: programme.name
            },
            institution: {
                code: institution.code,
                name: institution.name
            },
            name: student.name,
            batch: student.batch,
            aggregatePercentage: Math.round((totalMarks / maxMarks) * 10000) / 100,
            aggregateCreditPercentage: Math.round((totalCreditMarks / maxCreditMarks) * 10000) / 100,
            maxCredits,
            totalCreditsEarned: totalCredits,
            results
        };
        return APIResponse({
            data
        });
    }
    catch (err) {
        console.error(err);
        return InternalServerError;
    }
}

async function getRank(SemesterRankModel: Model<SemesterRank>, rollNumber: string, takenFrom: ObjectId) {
    return SemesterRankModel.findOne({ rollNumber, takenFrom });
}