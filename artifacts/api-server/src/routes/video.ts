import { Router, type IRouter } from "express";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { analyzeVideo, downloadToFile } from "../services/ytdlp.js";
import { AnalyzeVideoBody, DownloadVideoBody } from "@workspace/api-zod";
import { Download } from "../models/Download.js";
import { User } from "../models/User.js";
import { optionalAuth, type AuthRequest } from "../middlewares/auth.js";
import mongoose from "mongoose";

const PRO_PLANS = ["pro", "elite"];
const HIGH_RES_RESOLUTIONS = ["1440", "2160"];

const router: IRouter = Router();

// POST /analyze
router.post("/analyze", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = AnalyzeVideoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid URL provided" });
      return;
    }

    const { url } = parsed.data;

    try {
      new URL(url);
    } catch {
      res.status(400).json({ error: "Bad request", message: "Invalid URL format" });
      return;
    }

    const videoInfo = await analyzeVideo(url);
    res.json(videoInfo);
  } catch (err) {
    console.error("Analyze error:", err);
    const message = err instanceof Error ? err.message : "Failed to analyze video";
    res.status(422).json({ error: "Unprocessable", message });
  }
});

// POST /download
router.post("/download", optionalAuth, async (req: AuthRequest, res) => {
  try {
    const parsed = DownloadVideoBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid download request" });
      return;
    }

    const { url, formatId, title } = parsed.data;

    // High-res formats require Pro or Elite plan
    const isHighRes = HIGH_RES_RESOLUTIONS.some(r => formatId.includes(r));
    if (isHighRes) {
      if (!req.userId) {
        res.status(401).json({ error: "Unauthorized", message: "Sign in to download 1440p and 4K videos." });
        return;
      }
      const user = await User.findById(req.userId).lean();
      if (!user || (!req.userIsAdmin && !PRO_PLANS.includes(user.plan ?? "free"))) {
        res.status(403).json({ error: "Pro plan required", message: "1440p and 4K downloads require a Pro or Elite plan." });
        return;
      }
    }

    const ext = formatId === "bestaudio/best" ? "mp3" : formatId === "bestaudio" ? "m4a" : "mp4";
    const safeTitle = title.replace(/[^a-z0-9_\-\s]/gi, "_").substring(0, 100);
    const filename = `${safeTitle}.${ext}`;

    // Save download record if user is logged in
    if (req.userId) {
      Download.create({
        userId: new mongoose.Types.ObjectId(req.userId),
        videoTitle: title,
        videoUrl: url,
        selectedFormat: formatId,
        thumbnail: null,
      }).catch((e: unknown) => console.error("Failed to save download record:", e));
    }

    // Download to a temp file first — required for merged (video+audio) and
    // HLS streams because ffmpeg cannot write these to non-seekable stdout.
    const { filePath, cleanup } = await downloadToFile(url, formatId, ext, (line) => {
      console.log("yt-dlp:", line);
    });

    const fileStream = createReadStream(filePath);
    const { size } = await stat(filePath);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", size);

    fileStream.pipe(res);

    fileStream.on("end", () => {
      cleanup();
    });

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
      cleanup();
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream failed", message: err.message });
      } else {
        res.end();
      }
    });

    req.on("close", () => {
      fileStream.destroy();
      cleanup();
    });

  } catch (err) {
    console.error("Download error:", err);
    const message = err instanceof Error ? err.message : "Download failed";
    if (!res.headersSent) {
      res.status(422).json({ error: "Unprocessable", message });
    }
  }
});

export default router;
