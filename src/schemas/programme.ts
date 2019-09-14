import { Schema } from "mongoose";

export const programmeSchema = new Schema({
    code: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: new Date
    },
    takenFrom: {
        type: Schema.Types.ObjectId,
        required: true
    }
});