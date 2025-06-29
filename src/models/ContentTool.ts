import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export interface IContentTool extends Document {
  title: string;
  description: string;
  href: string;
  icon: string; // Storing the lucide-icon name as a string
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentToolSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    icon: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default models.ContentTool || model<IContentTool>('ContentTool', ContentToolSchema);
