import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import { readFile, unlink, readdir } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";
import multer from "multer";
import OpenAI from "openai";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { User } from "../models/User.js";

const router: IRouter = Router();

const TMP_DIR = process.env.TMP_DIR || "/tmp";
const YTDLP_PATH = process.env.YTDLP_PATH || "yt-dlp";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.originalname.match(/\.(mp3|mp4|wav|ogg|flac|webm|m4a|mov|mkv|avi)$/i) ||
      file.mimetype.startsWith("audio/") ||
      file.mimetype.startsWith("video/")
    ) {
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

function formatSrtTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const ms = Math.round((secs % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

function formatVttTime(secs: number): string {
  return formatSrtTime(secs).replace(",", ".");
}

function segmentsToSrt(segments: any[]): string {
  return segments
    .map((seg, i) =>
      `${i + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.text.trim()}\n`
    )
    .join("\n");
}

function segmentsToVtt(segments: any[]): string {
  const lines = ["WEBVTT", ""];
  segments.forEach((seg, i) => {
    lines.push(`${i + 1}`);
    lines.push(`${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}`);
    lines.push(seg.text.trim());
    lines.push("");
  });
  return lines.join("\n");
}

function srtToVtt(srt: string): string {
  return "WEBVTT\n\n" + srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
}

function parseSrtToSegments(srt: string): Array<{ start: string; end: string; text: string }> {
  const blocks = srt.trim().split(/\n\n+/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      const timeLine = lines.find((l) => l.includes("-->")) || "";
      const [startTime, endTime] = timeLine.split(" --> ");
      const timeIdx = lines.indexOf(timeLine);
      const text = lines.slice(timeIdx + 1).join(" ");
      return { start: startTime?.trim() || "", end: endTime?.trim() || "", text: text.trim() };
    })
    .filter((s) => s.text);
}

// POST /api/subtitles/youtube — fetch embedded YouTube subtitles (free, no auth)
router.post("/subtitles/youtube", async (req: any, res: any) => {
  const { url, lang = "en" } = req.body as { url?: string; lang?: string };
  if (!url) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  const id = randomUUID();
  const outputTemplate = path.join(TMP_DIR, `sf_subs_${id}`);

  try {
    const ytdlpArgs = [
      "--write-subs",
      "--write-auto-subs",
      "--sub-format", "srt",
      "--sub-langs", `${lang}.*,en.*,en`,
      "--skip-download",
      "--convert-subs", "srt",
      "--no-playlist",
      "-o", outputTemplate,
      url,
    ];

    let subtitleFound = false;
    let srtContent = "";
    let language = lang;

    try {
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(YTDLP_PATH, ytdlpArgs, { timeout: 60000 });
        let stderr = "";
        proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
        proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(stderr))));
        proc.on("error", reject);
      });

      const files = await readdir(TMP_DIR);
      const srtFile = files.find((f) => f.startsWith(`sf_subs_${id}`) && f.endsWith(".srt"));

      if (srtFile) {
        srtContent = await readFile(path.join(TMP_DIR, srtFile), "utf-8");
        const langMatch = srtFile.match(/\.([a-zA-Z\-]+)\.srt$/);
        if (langMatch) language = langMatch[1];
        subtitleFound = true;
        await unlink(path.join(TMP_DIR, srtFile)).catch(() => {});
      }
    } catch (_) {
      // No embedded subtitles found
    }

    let title = "";
    try {
      const metaOut = await new Promise<string>((resolve, reject) => {
        const proc = spawn(
          YTDLP_PATH,
          ["--dump-single-json", "--no-playlist", "--skip-download", url],
          { timeout: 30000 }
        );
        let stdout = "";
        proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
        proc.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error("meta failed"))));
        proc.on("error", reject);
      });
      title = JSON.parse(metaOut).title || "";
    } catch (_) {}

    if (subtitleFound && srtContent.trim()) {
      const vttContent = srtToVtt(srtContent);
      res.json({
        srt: srtContent,
        vtt: vttContent,
        title,
        language,
        source: "embedded",
        segments: parseSrtToSegments(srtContent).slice(0, 8),
      });
      return;
    }

    res.json({
      srt: null,
      vtt: null,
      title,
      language: null,
      source: "none",
      segments: [],
      message: "No embedded subtitles found for this video.",
    });
  } catch (err: any) {
    console.error("Subtitle fetch error:", err);
    res.status(500).json({ error: "Failed to fetch subtitles", message: err.message });
  }
});

// POST /api/subtitles/generate — AI-generate subtitles from YouTube URL (Pro+)
router.post("/subtitles/generate", authMiddleware, async (req: AuthRequest, res: any) => {
  const { url } = req.body as { url?: string };
  if (!url) {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  const user = await User.findById(req.userId).lean();
  if (!user || !(req.userIsAdmin || ["pro", "elite"].includes(user.plan ?? "free"))) {
    res.status(403).json({
      error: "Pro plan required",
      message: "Generating AI subtitles requires a Pro or Elite plan.",
    });
    return;
  }

  const id = randomUUID();
  const audioPath = path.join(TMP_DIR, `sf_audio_${id}.mp3`);

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(
        YTDLP_PATH,
        ["-f", "bestaudio/best", "-x", "--audio-format", "mp3", "--audio-quality", "128K",
          "-o", audioPath, "--no-playlist", url],
        { timeout: 300000 }
      );
      let stderr = "";
      proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(stderr))));
      proc.on("error", reject);
    });

    const groq = await getGroqClient();
    const audioBuffer = await readFile(audioPath);
    const audioFile = new File([audioBuffer], "audio.mp3", { type: "audio/mpeg" });

    const transcription: any = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });

    const segments = transcription.segments || [];
    const srt = segmentsToSrt(segments);
    const vtt = segmentsToVtt(segments);

    let title = "";
    try {
      const metaOut = await new Promise<string>((resolve, reject) => {
        const proc = spawn(
          YTDLP_PATH,
          ["--dump-single-json", "--no-playlist", "--skip-download", url],
          { timeout: 30000 }
        );
        let stdout = "";
        proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
        proc.on("close", (code) => (code === 0 ? resolve(stdout) : reject(new Error("meta failed"))));
        proc.on("error", reject);
      });
      title = JSON.parse(metaOut).title || "";
    } catch (_) {}

    res.json({
      srt,
      vtt,
      title,
      language: transcription.language || "en",
      source: "generated",
      segments: segments.slice(0, 8).map((s: any) => ({
        start: formatSrtTime(s.start),
        end: formatSrtTime(s.end),
        text: s.text.trim(),
      })),
    });
  } catch (err: any) {
    console.error("Subtitle generation error:", err);
    res.status(500).json({ error: "Subtitle generation failed", message: err.message });
  } finally {
    await unlink(audioPath).catch(() => {});
  }
});

// POST /api/subtitles/file — AI-generate subtitles from uploaded file (Pro+)
router.post("/subtitles/file", authMiddleware, upload.single("file"), async (req: AuthRequest, res: any) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const user = await User.findById(req.userId).lean();
  if (!user || !(req.userIsAdmin || ["pro", "elite"].includes(user.plan ?? "free"))) {
    res.status(403).json({
      error: "Pro plan required",
      message: "Generating subtitles from uploaded files requires a Pro or Elite plan.",
    });
    return;
  }

  try {
    const groq = await getGroqClient();
    const audioFile = new File([req.file.buffer], req.file.originalname, { type: req.file.mimetype });

    const transcription: any = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
    });

    const segments = transcription.segments || [];
    const srt = segmentsToSrt(segments);
    const vtt = segmentsToVtt(segments);

    res.json({
      srt,
      vtt,
      language: transcription.language || "en",
      source: "generated",
      segments: segments.slice(0, 8).map((s: any) => ({
        start: formatSrtTime(s.start),
        end: formatSrtTime(s.end),
        text: s.text.trim(),
      })),
    });
  } catch (err: any) {
    console.error("File subtitle error:", err);
    res.status(500).json({ error: "Subtitle generation failed", message: err.message });
  }
});

export default router;
