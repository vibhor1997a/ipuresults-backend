import { Schema } from "mongoose";

export const studentSchema = new Schema({
    rollNumber: {
        type: Number,
        required: true
    },
    studentId: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    schemeId: {
        type: Number,
        required: true
    },
    institutionCode: {
        type: Number,
        required: true
    },
    programmeCode: {
        type: Number,
        required: true
    },
    batch: {
        type: Number,
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