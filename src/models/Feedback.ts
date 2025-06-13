
import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export type FeedbackType = "Bug Report" | "Feature Request" | "General Comment";
export type FeedbackStatus = "New" | "In Progress" | "Resolved" | "Closed";

const allowedFeedbackTypes: FeedbackType[] = ["Bug Report", "Feature Request", "General Comment"];
const allowedFeedbackStatuses: FeedbackStatus[] = ["New", "In Progress", "Resolved", "Closed"];

export interface IFeedback extends Document {
  userId: Types.ObjectId; // Reference to the User who submitted it
  nameAtSubmission: string; // User's name when feedback was submitted
  emailAtSubmission: string; // User's email when feedback was submitted
  feedbackType: FeedbackType;
  subject: string;
  message: string;
  status: FeedbackStatus;
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nameAtSubmission: { type: String, required: true, trim: true },
    emailAtSubmission: { type: String, required: true, trim: true },
    feedbackType: { type: String, required: true, enum: allowedFeedbackTypes },
    subject: { type: String, required: true, trim: true, minlength: 3, maxlength: 150 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 2000 },
    status: { type: String, required: true, enum: allowedFeedbackStatuses, default: "New" },
    adminResponse: { type: String, trim: true },
  },
  { timestamps: true }
);

export default models.Feedback || model<IFeedback>('Feedback', FeedbackSchema);
