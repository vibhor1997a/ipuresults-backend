import { ParsedPage, ResultSetModel, PreparedResult, SubjectMap, InstitutionMap, ProgrammeMap } from "../../interfaces/result";
import { Connection, Model, Types, model } from "mongoose";
import { InstitutionModel } from "../../interfaces/institution";
import { ProgrammeModel } from "../../interfaces/programme";
import { StudentModel } from "../../interfaces/student";
import { SubjectModel } from "../../interfaces/subject";

interface PrepareInput {
    pages: ParsedPage[];
    conn: Connection;
    subjectsMap: SubjectMap;
    takenFrom: Types.ObjectId;
    institutionsMap: InstitutionMap;
    programmesMap: ProgrammeMap;
}

export function prepareForInsert({ pages, conn, takenFrom, subjectsMap, institutionsMap, programmesMap }: PrepareInput): PreparedResult {
    const InstitutionModel: Model<InstitutionModel> = conn.model('Institution');
    const ProgrammeModel: Model<ProgrammeModel> = conn.model('Programme');
    const StudentModel: Model<StudentModel> = conn.model('Student');
    const ResultSetModel: Model<ResultSetModel> = conn.model('ResultSet');
    const SubjectModel: Model<SubjectModel> = conn.model('Subject');
    const institutions: InstitutionModel[] = [];
    const programmes: ProgrammeModel[] = [];
    const students: StudentModel[] = [];
    const results: ResultSetModel[] = [];
    const subjects: SubjectModel[] = [];

    for (let schemeId of Object.keys(subjectsMap)) {
        for (let paperId of Object.keys(subjectsMap[schemeId])) {
            let subject = new SubjectModel(subjectsMap[schemeId][paperId]);
            subject.takenFrom = takenFrom;
            subjects.push(subject);
        }
    }

    for (let code of Object.keys(institutionsMap)) {
        const institution = new InstitutionModel(institutionsMap[code]);
        institution.takenFrom = takenFrom;
        institutions.push(institution);
    }

    for (let code of Object.keys(programmesMap)) {
        const programme = new ProgrammeModel(programmesMap[code]);
        programme.takenFrom = takenFrom;
        programmes.push(programme);
    }

    for (const page of pages) {
        for (let student of page.students) {
            let modelledStudent = new StudentModel(student);
            modelledStudent.takenFrom = takenFrom;
            students.push(modelledStudent);
        }
        for (let result of page.results) {
            let modelledResult = new ResultSetModel(result);
            modelledResult.takenFrom = takenFrom;
            let rollNumberMatch = result.rollNumber.match(/\d{3,3}(\d{3,3})(\d{3,3})\d{2,2}/);
            modelledResult.institutionCode = rollNumberMatch[1];
            modelledResult.programmeCode = rollNumberMatch[2];
            results.push(modelledResult);
        }
    }
    return {
        data: {
            institutions,
            programmes,
            students,
            results,
            subjects
        },
        models: {
            InstitutionModel,
            ProgrammeModel,
            ResultSetModel,
            StudentModel,
            SubjectModel
        }
    };
}

export async function insertIntoDB(prepared: PreparedResult) {
    const { models, data } = prepared;
    let { InstitutionModel, StudentModel, ResultSetModel, ProgrammeModel, SubjectModel } = models;
    let { institutions, programmes, results, students, subjects } = data;
    let toThrow;
    try {
        institutions = await InstitutionModel.insertMany(institutions);
    }
    catch (err) {
        console.error(err);
    }
    try {
        programmes = await ProgrammeModel.insertMany(programmes);
    }
    catch (err) {
        console.error(err);
    }
    try {
        subjects = await SubjectModel.insertMany(subjects);
    }
    catch (err) {
        console.error(err);
    }
    try {
        students = await StudentModel.insertMany(students);
    }
    catch (err) {
        toThrow = err;
    }
    try {
        results = await ResultSetModel.insertMany(results);
    }
    catch (err) {
        toThrow = err;
    }
    if (!toThrow) {
        return;
    }
    else {
        throw toThrow;
    }
}