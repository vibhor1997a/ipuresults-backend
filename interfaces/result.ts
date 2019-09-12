import { Institution } from "./institution";
import { Programme } from "./programme";
import { Subject } from "./subject";
import { Student } from "./student";

export type ResultPageType = 'result' | 'scheme' | 'invalid';
export type SpecialMarks = 'A' | 'CS' | 'D' | 'C' | 'RL' | 'AP';

export interface Marks {
    score: number;
    isSpecial: boolean;
    specialString: SpecialMarks;
}

export interface SemYear {
    type: 'sem' | 'year';
    num: number;
};

export interface SubjectResult {
    paperId: number;
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

export interface ParsedSchemePage {
    institution: Institution;
    programme: Programme;
    semYear: SemYear;
    schemeId: number;
    subjects: Subject[];
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