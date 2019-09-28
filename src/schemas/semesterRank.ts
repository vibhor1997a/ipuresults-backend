import { Schema } from "mongoose";

const institutionSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

export const semesterRankSchema = new Schema({
    institution: {
        type: institutionSchema,
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    takenFrom: {
        type: Schema.Types.ObjectId,
        required: true
    },
    collegeRank: {
        type: Number,
        required: true
    },
    universityRank: {
        type: Number,
        required: true
    }
});