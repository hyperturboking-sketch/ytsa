import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  await mongoose.connect(MONGODB_URI!, {
    dbName: "streamfetch",
    maxPoolSize: 50,        // up from default 5 — handles concurrent DB ops at scale
    minPoolSize: 5,         // keep warm connections ready
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 10000,
  });

  isConnected = true;
  console.log("Connected to MongoDB Atlas");
}

export default mongoose;
