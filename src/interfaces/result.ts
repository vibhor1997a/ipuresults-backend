import { Institution } from "./institution";
import { Programme } from "./programme";
import { Student } from "./student";
import { Types } from "mongoose";

export type ResultPageType = 'result' | 'scheme' | 'invalid';
export type SpecialMarks = 'A' | 'CS' | 'D' | 'C' | 'RL' | 'AP';

export interface Marks {
    score: number;
    isSpecial: boolean;
    specialString: SpecialMarks | undefined;
}

export interface Subject {
    schemeId: number;
    paperId: number;
    paperCode: string;
    name: string
    credits: number;
    type: string;
    mode: string;
    kind: string;
    major: number;
    minor: number;
    maxMarks: number;
    passMarks: number;
    exam: string;
}

export interface SemYear {
    type: 'sem' | 'year';
    num: number;
};

export interface SubjectMap {
    [schemeId: number]: {
        [paperId: number]: Subject
    }
}

export interface SubjectResult {
    subject: Subject;
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
    rollNumber: Number;
    schemeId: Number;
    studentId: Number;
    exam: Exam;
}

export interface SubjectResultModel extends SubjectResult, Types.Subdocument { }

export interface ResultSetModel extends ResultSet, Types.Subdocument {
    subjects: Types.DocumentArray<SubjectResultModel>
    createdAt: Date;
    takenFrom: Types.ObjectId
}

export interface ParsedSchemePage {
    institution: Institution;
    programme: Programme;
    semYear: SemYear;
    schemeId: number;
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