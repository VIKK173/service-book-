import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const bookingSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    workerId: {
      type: Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    serviceId: {
      type: Types.ObjectId,
      ref: "Service",
      required: true,
    },
    bookingCode: {
      type: String,
      default: "",
      trim: true,
    },
    subService: {
      type: String,
      default: "",
      trim: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "on_the_way", "completed", "cancelled", "confirmed", "in_progress"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    address: {
      houseNo: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ bookingDate: 1 });
bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ bookingCode: 1 });

export type Booking = InferSchemaType<typeof bookingSchema>;
export const BookingModel = models.Booking || model("Booking", bookingSchema);
