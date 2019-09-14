import { Document, Types } from "mongoose";

export interface Programme {
    code: number;
    name: string;
}

export interface ProgrammeModel extends Document, Programme {
    createdAt: Date;
    takenFrom: Types.ObjectId
}