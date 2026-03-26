import { Schema, model, models, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
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
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    address: {
      houseNo: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      geo: {
        lat: Number,
        lng: Number,
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ createdAt: -1 });

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = models.User || model("User", userSchema);

