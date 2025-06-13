
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IExperiment extends Document {
  title: string;
  description: string;
  tryHereLink: string;
  youtubeVideoLink?: string;
  category: "WEB DEVELOPMENT" | "ML" | "AI" | string; // Form enforces enum
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ExperimentSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    tryHereLink: { type: String, required: true, trim: true },
    youtubeVideoLink: { type: String, trim: true, optional: true },
    category: { type: String, required: true, trim: true, enum: ["WEB DEVELOPMENT", "ML", "AI"] },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default models.Experiment || model<IExperiment>('Experiment', ExperimentSchema);
