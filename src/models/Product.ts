
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  tryHereLink: string;
  youtubeVideoLink?: string;
  category: string;
  tags: string[]; // Storing tags as an array of strings
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    tryHereLink: { type: String, required: true, trim: true },
    youtubeVideoLink: { type: String, trim: true, optional: true },
    category: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    tags: [{ type: String, trim: true }], // Comma-separated string will be converted to array in API
  },
  { timestamps: true } // Adds createdAt and updatedAt timestamps
);

export default models.Product || model<IProduct>('Product', ProductSchema);
