
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IContentHandle extends Document {
  name: string;
  link: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentHandleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    link: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 200 },
  },
  { timestamps: true }
);

export default models.ContentHandle || model<IContentHandle>('ContentHandle', ContentHandleSchema);
