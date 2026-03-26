import { Schema, model, models, type InferSchemaType } from "mongoose";

const serviceSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 60,
      min: 15,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

serviceSchema.index({ category: 1, isActive: 1 });

export type Service = InferSchemaType<typeof serviceSchema>;
export const ServiceModel = models.Service || model("Service", serviceSchema);

