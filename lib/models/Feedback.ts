import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const feedbackSchema = new Schema(
  {
    bookingId: {
      type: Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerId: {
      type: Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    serviceId: {
      type: Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceStars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    workerStars: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    adminReply: {
      type: String,
      default: "",
      trim: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

feedbackSchema.index({ bookingId: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ serviceStars: 1 });

export type Feedback = InferSchemaType<typeof feedbackSchema>;
export const FeedbackModel = models.Feedback || model("Feedback", feedbackSchema);
