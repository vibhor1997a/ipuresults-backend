import { Document, Types } from "mongoose";

export interface Subject {
    schemeId: string;
    paperId: string;
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

export interface SubjectModel extends Document, Subject {
    takenFrom: Types.ObjectId;
}