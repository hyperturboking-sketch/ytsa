import mongoose, { Schema, Document, Model } from "mongoose";

export type PlanType = "free" | "basic" | "pro" | "elite";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  googleId?: string;
  avatar?: string;
  isAdmin: boolean;
  plan: PlanType;
  planExpiresAt?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
    isAdmin: { type: Boolean, default: false },
    plan: { type: String, enum: ["free", "basic", "pro", "elite"], default: "free" },
    planExpiresAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
