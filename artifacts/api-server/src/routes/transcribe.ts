import { Router, type IRouter, type Response } from "express";
import { readFile } from "fs/promises";
import OpenAI from "openai";
import multer from "multer";
import { downloadToFile } from "../services/ytdlp.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router: IRouter = Router();

const ALLOWED_PLANS = ["elite"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit (Groq max)
  fileFilter: (_req, file, cb) => {
    const allowed = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/x-wav", "audio/ogg", "audio/flac", "audio/webm", "video/mp4", "video/webm", "video/quicktime", "audio/m4a", "audio/x-m4a"];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp3|mp4|wav|ogg|flac|webm|m4a|mov)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload an audio or video file."));
    }
  },
});

async function getGroqClient() {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error("AI service not configured");
  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: groqApiKey,
  });
}

async function checkAccess(req: AuthRequest, res: Response): Promise<boolean> {
  const user = await User.findById(req.userId).lean();
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return false;
  }
  const hasAccess = req.userIsAdmin || ALLOWED_PLANS.includes(user.plan ?? "free");
  if (!hasAccess) {
    res.status(403).json({
      error: "Elite plan required",
      message: "AI Transcription is an Elite plan feature. Please upgrade to access it.",
    });
    return false;
  }
  return true;
}

// POST /transcribe — transcribe from YouTube URL
router.post("/transcribe", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { url } = req.body as { url?: string };
  if (!url) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  if (!(await checkAccess(req, res))) return;

  let cleanup: (() => Promise<void>) | null = null;
  try {
    const groq = await getGroqClient();
    const result = await downloadToFile(url, "bestaudio/best", "mp3");
    cleanup = result.cleanup;

    const audioBuffer = await readFile(result.filePath);
    const audioFile = new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      response_format: "json",
    });

    res.json({ transcript: transcription.text });
  } catch (err: any) {
    console.error("Transcription error:", err);
    res.status(500).json({
      error: "Transcription failed",
      message: err.message || "An unexpected error occurred.",
    });
  } finally {
    if (cleanup) await cleanup();
  }
});

// POST /transcribe/file — transcribe from uploaded file
router.post("/transcribe/file", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  if (!(await checkAccess(req, res))) return;

  try {
    const groq = await getGroqClient();
    const audioFile = new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype });

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      response_format: "json",
    });

    res.json({ transcript: transcription.text });
  } catch (err: any) {
    console.error("File transcription error:", err);
    res.status(500).json({
      error: "Transcription failed",
      message: err.message || "An unexpected error occurred.",
    });
  }
});

export default router;
