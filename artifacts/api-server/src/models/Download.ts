import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDownload extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId | null;
  videoTitle: string;
  videoUrl: string;
  selectedFormat: string;
  thumbnail: string | null;
  createdAt: Date;
}

const DownloadSchema = new Schema<IDownload>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    videoTitle: { type: String, required: true },
    videoUrl: { type: String, required: true },
    selectedFormat: { type: String, required: true },
    thumbnail: { type: String, default: null },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

export const Download: Model<IDownload> =
  mongoose.models.Download || mongoose.model<IDownload>("Download", DownloadSchema);
