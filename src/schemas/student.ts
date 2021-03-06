import { Schema } from "mongoose";

export const studentSchema = new Schema({
    rollNumber: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    schemeId: {
        type: String,
        required: true
    },
    institutionCode: {
        type: String,
        required: true
    },
    programmeCode: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
    takenFrom: {
        type: Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date
    }
});