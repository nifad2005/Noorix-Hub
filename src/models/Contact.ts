
import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export interface IContact extends Document {
  name?: string;
  email: string;
  subject?: string;
  message?: string;
  userId?: Types.ObjectId; // Optional: if the user was logged in
  isResolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: { type: String, trim: true, maxlength: 100 }, // Not required
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 100 },
    subject: { type: String, trim: true, maxlength: 150 }, // Not required, removed minlength
    message: { type: String, trim: true, maxlength: 2000 }, // Not required, removed minlength
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Basic email validation
ContactSchema.path('email').validate((email: string) => {
  const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailRegex.test(email);
}, 'Please provide a valid email address.');

export default models.Contact || model<IContact>('Contact', ContactSchema);
