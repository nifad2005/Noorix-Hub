
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  featuredImage?: string;
  category: "WEB DEVELOPMENT" | "ML" | "AI" | string; // Allow string for wider compatibility if needed, but form enforces enum
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 150 },
    content: { type: String, required: true, trim: true, minlength: 50 },
    featuredImage: { type: String, trim: true, optional: true },
    category: { type: String, required: true, trim: true, enum: ["WEB DEVELOPMENT", "ML", "AI"] },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default models.Blog || model<IBlog>('Blog', BlogSchema);
