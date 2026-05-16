import mongoose, { Schema, Document, Model } from "mongoose";
import { PlanType } from "./User.js";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  plan: PlanType;
  billing: "monthly" | "annual";
  amountUsd: number;
  merchantTradeNo: string;
  nowpaymentsOrderId?: string;
  status: "pending" | "paid" | "expired" | "failed";
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["basic", "pro", "elite"], required: true },
    billing: { type: String, enum: ["monthly", "annual"], default: "monthly" },
    amountUsd: { type: Number, required: true },
    merchantTradeNo: { type: String, required: true, unique: true },
    nowpaymentsOrderId: { type: String, default: null },
    status: { type: String, enum: ["pending", "paid", "expired", "failed"], default: "pending" },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
