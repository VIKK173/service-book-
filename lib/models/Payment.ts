import { Schema, model, models, Types, type InferSchemaType } from "mongoose";

const paymentSchema = new Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["upi", "card", "cash", "netbanking"],
      default: "upi",
    },
    transactionId: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

export type Payment = InferSchemaType<typeof paymentSchema>;
export const PaymentModel = models.Payment || model("Payment", paymentSchema);

