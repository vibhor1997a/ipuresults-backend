import { Schema } from "mongoose";

export const subjectSchema = new Schema({
    paperId: {
        type: String,
        required: true
    },
    schemeId: {
        type: String,
        required: true
    },
    paperCode: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true
    },
    kind: {
        type: String,
        required: true
    },
    major: Number,
    minor: Number,
    exam: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date
    },
    passMarks: {
        type: Number,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    takenFrom: {
        type: Schema.Types.ObjectId,
        required: true
    }
});