import { Institution, InstitutionModel } from "./institution";
import { Programme, ProgrammeModel } from "./programme";
import { Student, StudentModel } from "./student";
import { Types, Document, Model } from "mongoose";
import { Subject, SubjectModel } from "./subject";

export type ResultPageType = 'result' | 'scheme' | 'invalid';
export type SpecialMarks = 'A' | 'CS' | 'D' | 'C' | 'RL' | 'AP';

export interface Marks {
    score: number;
    isSpecial: boolean;
    specialString: SpecialMarks | undefined;
}

export interface SemYear {
    type: 'sem' | 'year';
    num: number;
};

export interface SubjectMap {
    [schemeId: string]: {
        [paperId: string]: Subject
    }
}

export interface InstitutionMap {
    [code: string]: Institution;
}

export interface ProgrammeMap {
    [code: string]: Programme;
}

export interface SubjectResult {
    paperId: string;
    credits: number;
    grade: string;
    totalMarks: Marks;
    major: Marks;
    minor: Marks;
}

export interface Exam {
    regularReappear: 'regular' | 'reappear';
    special: string | undefined;
    date: Date;
}

export interface ResultSet {
    subjects: SubjectResult[];
    totalCredits: number;
    declaredDate: Date;
    preparedDate: Date;
    semYear: SemYear;
    rollNumber: string;
    schemeId: string;
    studentId: string;
    exam: Exam;
    pageNumber: number;
}

export interface SubjectResultModel extends SubjectResult, Types.Subdocument { }

export interface ResultSetModel extends ResultSet, Document {
    subjects: Types.DocumentArray<SubjectResultModel>
    createdAt: Date;
    takenFrom: Types.ObjectId
    institutionCode: string;
    programmeCode: string;
}

export interface ParsedSchemePage {
    institution: Institution;
    programme: Programme;
    semYear: SemYear;
    schemeId: string;
    subjects: SubjectMap;
    pageNumber: number;
}

export interface ParsedResultPage {
    institution: Institution;
    programme: Programme;
    semYear: SemYear;
    results: ResultSet[];
    students: Student[];
    pageNumber: number;
}

export interface ParsedPage {
    // institution: Institution;
    // programme: Programme;
    // subjects: SubjectMap;
    pageNumber: number;
    results: ResultSet[];
    students: Student[];
}

export interface PreparedData {
    institutions: InstitutionModel[];
    programmes: ProgrammeModel[];
    results: ResultSetModel[];
    students: StudentModel[];
    subjects: SubjectModel[];
}

export interface PreparedModels {
    InstitutionModel: Model<InstitutionModel>;
    ProgrammeModel: Model<ProgrammeModel>;
    ResultSetModel: Model<ResultSetModel>;
    StudentModel: Model<StudentModel>;
    SubjectModel: Model<SubjectModel>;
}

export interface PreparedResult {
    data: PreparedData;
    models: PreparedModels;
}

interface ResponseMarks {
    max: number;
    earned: number | string;
}

export interface ResponseSubjectResult {
    name: string;
    minor: ResponseMarks;
    major: ResponseMarks;
    total: ResponseMarks;
    isPassed: boolean;
    credits: number
}

export interface ResponseSemesterResult {
    fileId: string;
    semYear: SemYear;
    exam: Exam;
    creditsEarned: number;
    declared: Date,
    prepared: Date,
    subjects: ResponseSubjectResult[];
    percentage?: number;
    creditPercentage?: number;
    totalMarks?: number;
    maxMarks?: number;
}

export interface ResponseResult {
    rollNumber: string;
    name: string;
    programme: Programme,
    institution: Institution,
    batch: string;
    results: ResponseSemesterResult[];
    aggregatePercentage: number;
    aggregateCreditPercentage: number;
    totalCreditsEarned: number;
    maxCredits: number;
}