
import mongoose, { Schema, Document, models, model, Types } from 'mongoose';

export type ProductStatus = "beta" | "new released" | "featured" | "experimental";
const allowedProductStatuses: ProductStatus[] = ["beta", "new released", "featured", "experimental"];

export interface IProduct extends Document {
  title: string;
  description: string;
  tryHereLink: string;
  youtubeVideoLink?: string;
  category: "WEB DEVELOPMENT" | "ML" | "AI";
  tags: string[];
  status: ProductStatus;
  createdBy: Types.ObjectId; // Reference to the User who created it
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    tryHereLink: { type: String, required: true, trim: true },
    youtubeVideoLink: { type: String, trim: true },
    category: { type: String, required: true, trim: true, enum: ["WEB DEVELOPMENT", "ML", "AI"] },
    tags: [{ type: String, trim: true }],
    status: { type: String, required: true, enum: allowedProductStatuses },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default models.Product || model<IProduct>('Product', ProductSchema);
