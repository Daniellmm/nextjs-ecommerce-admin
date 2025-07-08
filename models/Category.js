import mongoose, { Schema, model, models } from "mongoose";
import { type } from "os";

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    parent: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        default: null
    },
    properties: [
        {
            name: { type: String, required: true },
            values: [{ type: String, required: true }]
        }
    ]
});

export const Category = models.Category || model("Category", CategorySchema);
