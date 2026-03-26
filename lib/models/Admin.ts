import { Schema, model, models, type InferSchemaType } from "mongoose";

const adminSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      default: "super_admin",
      enum: ["super_admin", "operations_admin", "finance_admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type Admin = InferSchemaType<typeof adminSchema>;
export const AdminModel = models.Admin || model("Admin", adminSchema);

