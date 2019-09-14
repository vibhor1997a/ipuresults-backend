import { Schema } from "mongoose";

const examSchema = new Schema({
    regularReappear: {
        type: String,
        required: true
    },
    special: String,
    date: Date
});

const marksSchema = new Schema({
    score: {
        type: Number,
        required: true
    },
    isSpecial: {
        type: Boolean,
        required: true
    },
    specialString: String
});

const subjectResultSchema = new Schema({
    paperId: {
        type: String,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: marksSchema,
        required: true
    },
    major: {
        type: marksSchema,
        required: true
    },
    minor: {
        type: marksSchema,
        required: true
    },
    grade: String
});

const semYearSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    num: {
        type: Number,
        required: true
    }
});

export const resultSetSchema = new Schema({
    pageNumber: {
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
    },
    rollNumber: {
        type: String,
        required: true
    },
    totalCredits: {
        type: Number,
        required: true
    },
    declaredDate: {
        type: Date,
        required: true
    },
    preparedDate: {
        type: Date,
        required: true
    },
    schemeId: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    semYear: {
        type: semYearSchema,
        required: true
    },
    exam: {
        type: examSchema,
        required: true
    },
    subjects: {
        type: [subjectResultSchema],
        required: true
    },
    programmeCode: {
        type: String,
        required: true
    },
    institutionCode: {
        type: String,
        required: true
    }
});