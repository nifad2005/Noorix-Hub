
import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  featuredImage?: string;
  category: "WEB DEVELOPMENT" | "ML" | "AI";
  tags: string[];
  createdBy: Types.ObjectId; // Reference to the User who created it
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 5, maxlength: 150 },
    content: { type: String, required: true, trim: true, minlength: 50 },
    featuredImage: { type: String, trim: true }, // Removed optional: true
    category: { type: String, required: true, trim: true, enum: ["WEB DEVELOPMENT", "ML", "AI"] },
    tags: [{ type: String, trim: true }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default models.Blog || model<IBlog>('Blog', BlogSchema);
