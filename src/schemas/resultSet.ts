import { Schema } from "mongoose";

const subjectSchema = new Schema({
    paperId: {
        type: Number,
        required: true
    },
    schemeId: {
        type: Number,
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
    major: {
        type: Number,
        required: true
    },
    minor: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    exam: {
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
    subject: {
        type: subjectSchema,
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
        type: Number,
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
        type: Number,
        required: true
    },
    studentId: {
        type: Number,
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
        type: Number,
        required: true
    },
    institutionCode: {
        type: Number,
        required: true
    }
});