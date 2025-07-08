import mongoose, { Schema, model, models } from "mongoose";
import { Category } from "./Category";
import { type } from "os";


const ProductSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    images:
        [{ type: String }],
    category: {
        type: mongoose.Types.ObjectId,
        ref: 'Category'
    },
    properties: { type: Object },
    discount: { type: Number },
    percentage: { type: Number },
    rating: { type: Number },
    topSelling: { type: Boolean, default: false },
}, {
    timestamps: true
});
export const Product = models.Product || model("Product", ProductSchema);

