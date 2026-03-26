import { Schema, model, models, type InferSchemaType } from "mongoose";

const workerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    totalJobs: {
      type: Number,
      default: 0,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    dutyStatus: {
      type: String,
      enum: ["available", "busy", "off_duty"],
      default: "available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    city: {
      type: String,
      default: "Ranchi",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

workerSchema.index({ category: 1 });
workerSchema.index({ isAvailable: 1 });
workerSchema.index({ email: 1 });

export type Worker = InferSchemaType<typeof workerSchema>;
export const WorkerModel = models.Worker || model("Worker", workerSchema);
