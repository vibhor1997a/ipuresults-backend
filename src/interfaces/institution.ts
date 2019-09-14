import { Document, Types } from "mongoose";

export interface Institution {
    code: string;
    name: string;
}

export interface InstitutionModel extends Document, Institution {
    createdAt: Date;
    takenFrom: Types.ObjectId
}