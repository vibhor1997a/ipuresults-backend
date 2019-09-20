import { Schema } from "mongoose";

export const semesterScoreSchema = new Schema({
    institutionCode: String,
    marks: Number,
    name: String,
    rollNumber: String,
    takenFrom: Schema.Types.ObjectId
});