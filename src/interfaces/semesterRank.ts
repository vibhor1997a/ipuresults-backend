import { Document, Types } from "mongoose";

interface SemesterRankInstitution extends Types.Subdocument {
    code: string;
    name: string
}

export interface SemesterRank extends Document {
    institution: SemesterRankInstitution;
    marks: number;
    name: string;
    rollNumber: string;
    takenFrom: Types.ObjectId;
    collegeRank: number;
    universityRank: number
    batch: string;
}