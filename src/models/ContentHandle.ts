
import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export interface IContentHandle extends Document {
  name: string;
  link: string;
  description?: string;
  position: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ContentHandleSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    link: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    position: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default models.ContentHandle || model<IContentHandle>('ContentHandle', ContentHandleSchema);
