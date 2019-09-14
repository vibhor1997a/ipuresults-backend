import { Document, Types } from "mongoose";

export interface Student {
    rollNumber: string;
    studentId: string;
    name: string;
    schemeId: string;
    institutionCode: string;
    programmeCode: string;
    batch: string;
}

export interface StudentModel extends Document, Student {
    createdAt: Date;
    takenFrom: Types.ObjectId
}