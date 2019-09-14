import { Document, Types } from "mongoose";

export interface Student {
    rollNumber: number;
    studentId: number;
    name: string;
    schemeId: number;
    institutionCode: number;
    programmeCode: number;
    batch: number;
}

export interface StudentModel extends Document, Student {
    createdAt: Date;
    takenFrom: Types.ObjectId
}