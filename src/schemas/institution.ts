import { Schema } from "mongoose";

export const institutionSchema = new Schema({
    code: {
        type: String,
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