import { Document, Types } from "mongoose";

export interface SemesterScore extends Document {
    institutionCode: string;
    marks: number;
    name: string;
    rollNumber: string;
    takenFrom: Types.ObjectId;
}