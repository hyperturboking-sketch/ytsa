import { Router, type IRouter } from "express";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { EventEmitter } from "events";
import { analyzeVideo, downloadToFile } from "../services/ytdlp.js";
import { AnalyzeVideoBody, DownloadVideoBody } from "@workspace/api-zod";
import { Download } from "../models/Download.js";
import { User } from "../models/User.js";
import { optionalAuth, type AuthRequest } from "../middlewares/auth.js";
import mongoose from "mongoose";

const PRO_PLANS = ["pro", "elite"];
const HIGH_RES_RESOLUTIONS = ["1440", "2160"];

const router: IRouter = Router();

// In-memory per-job progress emitter — auto-cleared after 10 min
const jobEmitters = new Map<string, EventEmitter>();

function getJobEmitter(jobId: string): EventEmitter {
  let em = jobEmitters.get(jobId);
  if (!em) {
    em = new EventEmitter();
    em.setMaxListeners(10);
    jobEmitters.set(jobId, em);
    setTimeout(() => jobEmitters.delete(jobId), 10 * 60 * 1000);
  }
  return em;
}

function parseYtDlpLine(line: string): object | null {
  // [download]  45.2% of 123.45MiB at 5.23MiB/s ETA 00:23
  const pMatch = line.match(
    /\[download\]\s+(\d+\.?\d*)%(?:\s+of\s+[\d.]+\S+)?\s+at\s+([\d.]+\s*\S+)\s+ETA\s+(\S+)/
  );
  if (pMatch) {
    return {
      progress: Math.round(parseFloat(pMatch[1])),
      status: "downloading",
      speed: pMatch[2],
      eta: pMatch[3],
    };
  }
  if (line.includes("[Merger]") || line.toLowerCase().includes("merging formats")) {
    return { progress: 97, status: "merging" };
  }
  return null;
}

// GET /download/progress/:jobId — SSE
router.get("/download/progress/:jobId", (req, res) => {
  const { jobId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const em = getJobEmitter(jobId);

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const onProgress = (data: object) => send(data);
  const onDone = () => { send({ progress: 100, status: "done" }); res.end(); };
  const onFail = (msg: string) => { send({ status: "error", message: msg }); res.end(); };

  em.on("progress", onProgress);
  em.once("done", onDone);
  em.once("fail", onFail);

  req.on("close", () => {
    em.off("progress", onProgress);
    em.off("done", onDone);
    em.off("fail", onFail);
  });
});

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
    const jobId = typeof req.query.jobId === "string" ? req.query.jobId : null;
    const em = jobId ? getJobEmitter(jobId) : null;

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

    if (req.userId) {
      Download.create({
        userId: new mongoose.Types.ObjectId(req.userId),
        videoTitle: title,
        videoUrl: url,
        selectedFormat: formatId,
        thumbnail: null,
      }).catch((e: unknown) => console.error("Failed to save download record:", e));
    }

    const { filePath, cleanup } = await downloadToFile(url, formatId, ext, (line) => {
      console.log("yt-dlp:", line);
      if (em) {
        const event = parseYtDlpLine(line);
        if (event) em.emit("progress", event);
      }
    });

    if (em) em.emit("done");

    const fileStream = createReadStream(filePath);
    const { size } = await stat(filePath);

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", size);

    fileStream.pipe(res);

    fileStream.on("end", () => cleanup());

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
