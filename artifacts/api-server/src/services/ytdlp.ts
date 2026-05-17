import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { unlink, stat } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";

/**
 * Simple async semaphore — caps how many yt-dlp processes can run concurrently.
 * Excess callers get a rejection immediately (no unbounded queue) so the server
 * stays responsive under load rather than stacking up thousands of processes.
 */
class Semaphore {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private readonly max: number) {}

  acquire(): Promise<() => void> {
    return new Promise((resolve, reject) => {
      const tryRun = () => {
        if (this.running < this.max) {
          this.running++;
          resolve(() => {
            this.running--;
            const next = this.queue.shift();
            if (next) next();
          });
        } else {
          this.queue.push(tryRun);
        }
      };

      // If already over capacity, reject straight away instead of queueing forever
      if (this.running >= this.max && this.queue.length >= this.max * 2) {
        reject(new Error("Server busy — too many concurrent requests. Please try again shortly."));
        return;
      }
      tryRun();
    });
  }
}

// Allow up to 15 simultaneous analyze jobs and 8 simultaneous downloads.
// Each yt-dlp process is CPU + network bound; beyond these limits the server
// degrades for everyone instead of serving requests in an orderly queue.
const analyzeSemaphore = new Semaphore(15);
const downloadSemaphore = new Semaphore(8);

export interface VideoFormat {
  formatId: string;
  label: string;
  ext: string;
  resolution: string | null;
  filesize: number | null;
  type: "video" | "audio";
  requiresPro?: boolean;
}

export interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  url: string;
  formats: VideoFormat[];
}

const YTDLP_PATH = process.env.YTDLP_PATH || "/home/runner/.local/bin/yt-dlp";
const TMP_DIR = process.env.TMP_DIR || "/tmp";

const ARIA2C_PATH = (() => {
  try {
    const { execSync } = require("child_process");
    return execSync("which aria2c", { encoding: "utf8" }).trim();
  } catch { return null; }
})();

const BASE_ARGS = [
  "--extractor-args", "youtube:player_client=android_vr",
];

function runYtDlp(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(YTDLP_PATH, [...BASE_ARGS, ...args], { timeout: 60000 });
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on("data", (d: Buffer) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr || `yt-dlp exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to run yt-dlp: ${err.message}`));
    });
  });
}

/** Bytes from bitrate (kbps) × duration (seconds). Returns null if either is missing. */
function bitrateToBytes(kbps: any, duration: number | null): number | null {
  if (typeof kbps !== "number" || kbps <= 0 || !duration) return null;
  return Math.round((kbps * 1000 / 8) * duration);
}

/** Best size estimate for a single format record (exact → approx → bitrate calc). */
function formatSize(f: any, duration: number | null): number | null {
  if (typeof f.filesize === "number" && f.filesize > 0) return f.filesize;
  if (typeof f.filesize_approx === "number" && f.filesize_approx > 0) return f.filesize_approx;
  return bitrateToBytes(f.tbr ?? f.vbr ?? f.abr, duration);
}

/**
 * Estimate combined filesize (best video + best audio) for a given max height.
 * Falls back to bitrate × duration if filesize fields are absent (e.g. HLS streams).
 */
function estimateMergedFilesize(rawFormats: any[], maxHeight: number, duration: number | null): number | null {
  // Prefer video-only DASH streams
  const videoStreams = rawFormats.filter(
    (f: any) =>
      typeof f.height === "number" &&
      f.height <= maxHeight &&
      f.vcodec && f.vcodec !== "none" &&
      (!f.acodec || f.acodec === "none")
  );

  // Fallback: combined streams (older sites / lower resolutions)
  const combinedStreams = rawFormats.filter(
    (f: any) =>
      typeof f.height === "number" &&
      f.height <= maxHeight &&
      f.vcodec && f.vcodec !== "none" &&
      f.acodec && f.acodec !== "none"
  );

  const videoStream = videoStreams.length > 0
    ? videoStreams.sort((a: any, b: any) => b.height - a.height)[0]
    : combinedStreams.length > 0
    ? combinedStreams.sort((a: any, b: any) => b.height - a.height)[0]
    : null;

  if (!videoStream) return null;

  const videoSize = formatSize(videoStream, duration);

  // Best audio-only stream
  const audioStreams = rawFormats.filter(
    (f: any) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
  );

  let audioSize: number | null = null;
  if (audioStreams.length > 0) {
    // Pick highest-bitrate audio stream for size estimate
    audioStreams.sort((a: any, b: any) => {
      const ba = a.tbr ?? a.abr ?? 0;
      const bb = b.tbr ?? b.abr ?? 0;
      return bb - ba;
    });
    audioSize = formatSize(audioStreams[0], duration);
  }

  if (typeof videoSize === "number" && typeof audioSize === "number") {
    return videoSize + audioSize;
  }
  return typeof videoSize === "number" ? videoSize : null;
}

function estimateAudioFilesize(rawFormats: any[], duration: number | null, fallbackKbps = 128): number | null {
  // Try audio-only streams first
  const audioOnly = rawFormats.filter(
    (f: any) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none")
  );

  if (audioOnly.length > 0) {
    audioOnly.sort((a: any, b: any) => {
      const ba = a.tbr ?? a.abr ?? 0;
      const bb = b.tbr ?? b.abr ?? 0;
      return bb - ba;
    });
    const size = formatSize(audioOnly[0], duration);
    if (size !== null) return size;
  }

  // Fallback: estimate from combined stream's audio bitrate only
  const combined = rawFormats.filter(
    (f: any) => f.acodec && f.acodec !== "none" && f.vcodec && f.vcodec !== "none"
  );

  if (combined.length > 0) {
    combined.sort((a: any, b: any) => {
      const ba = a.abr ?? 0;
      const bb = b.abr ?? 0;
      return bb - ba;
    });
    const best = combined[0];
    const size = bitrateToBytes(best.abr ?? best.tbr, duration);
    if (size !== null) return size;
  }

  // Last resort: use duration × typical audio bitrate
  return bitrateToBytes(fallbackKbps, duration);
}

export async function analyzeVideo(url: string): Promise<VideoInfo> {
  const release = await analyzeSemaphore.acquire();
  const metaJson = await runYtDlp([
    "--dump-json",
    "--no-playlist",
    "--skip-download",
    url,
  ]).finally(release);

  const meta = JSON.parse(metaJson);
  const rawFormats: any[] = Array.isArray(meta.formats) ? meta.formats : [];
  const duration: number | null = typeof meta.duration === "number" ? meta.duration : null;

  const has2160 = rawFormats.some((f: any) => typeof f.height === "number" && f.height >= 2160);
  const has1440 = rawFormats.some((f: any) => typeof f.height === "number" && f.height >= 1440);

  const formats: VideoFormat[] = [
    ...(has2160 ? [{
      formatId: "bestvideo[height<=2160]+bestaudio/bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160]/best",
      label: "2160p 4K MP4",
      ext: "mp4",
      resolution: "2160p",
      filesize: estimateMergedFilesize(rawFormats, 2160, duration),
      type: "video" as const,
      requiresPro: true,
    }] : []),
    ...(has1440 ? [{
      formatId: "bestvideo[height<=1440]+bestaudio/bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440]/best",
      label: "1440p QHD MP4",
      ext: "mp4",
      resolution: "1440p",
      filesize: estimateMergedFilesize(rawFormats, 1440, duration),
      type: "video" as const,
      requiresPro: true,
    }] : []),
    {
      formatId: "bestvideo[height<=1080]+bestaudio/bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]/best",
      label: "1080p MP4",
      ext: "mp4",
      resolution: "1080p",
      filesize: estimateMergedFilesize(rawFormats, 1080, duration),
      type: "video",
    },
    {
      formatId: "bestvideo[height<=720]+bestaudio/bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]/best",
      label: "720p MP4",
      ext: "mp4",
      resolution: "720p",
      filesize: estimateMergedFilesize(rawFormats, 720, duration),
      type: "video",
    },
    {
      formatId: "bestvideo[height<=480]+bestaudio/bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]/best",
      label: "480p MP4",
      ext: "mp4",
      resolution: "480p",
      filesize: estimateMergedFilesize(rawFormats, 480, duration),
      type: "video",
    },
    {
      formatId: "bestvideo[height<=360]+bestaudio/bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]/best",
      label: "360p MP4",
      ext: "mp4",
      resolution: "360p",
      filesize: estimateMergedFilesize(rawFormats, 360, duration),
      type: "video",
    },
    {
      formatId: "bestaudio/best",
      label: "Audio MP3",
      ext: "mp3",
      resolution: null,
      filesize: estimateAudioFilesize(rawFormats, duration, 192),
      type: "audio",
    },
    {
      formatId: "bestaudio",
      label: "Audio M4A",
      ext: "m4a",
      resolution: null,
      filesize: estimateAudioFilesize(rawFormats, duration, 128),
      type: "audio",
    },
  ];

  return {
    title: String(meta.title || "Unknown Video"),
    thumbnail: meta.thumbnail ? String(meta.thumbnail) : null,
    duration: typeof meta.duration === "number" ? meta.duration : null,
    url,
    formats,
  };
}

export interface DownloadResult {
  filePath: string;
  cleanup: () => Promise<void>;
}

/**
 * Download a video/audio to a temp file and return the path.
 * Always downloads to disk first — avoids ffmpeg stdout-pipe failures
 * with HLS/DASH merged streams (YouTube SABR, m3u8, etc.).
 */
export async function downloadToFile(
  url: string,
  formatId: string,
  ext: string,
  onStderr?: (line: string) => void
): Promise<DownloadResult> {
  const release = await downloadSemaphore.acquire();
  const id = randomUUID();
  const isAudioMp3 = formatId === "bestaudio/best";
  const isAudioM4a = formatId === "bestaudio";

  // For audio with -x, yt-dlp handles the extension itself.
  // Use %(ext)s so we know exactly where the final file lands.
  const outTemplate = path.join(TMP_DIR, `ytsave_${id}.%(ext)s`);

  let args: string[];

  if (isAudioMp3) {
    args = [
      "-f", "bestaudio/best",
      "-x",
      "--audio-format", "mp3",
      "--audio-quality", "192K",
      "-o", outTemplate,
      "--no-playlist",
      url,
    ];
  } else if (isAudioM4a) {
    args = [
      "-f", "bestaudio",
      "-x",
      "--audio-format", "m4a",
      "-o", outTemplate,
      "--no-playlist",
      url,
    ];
  } else {
    // Video: merge best video+audio streams with ffmpeg.
    // Use aria2c as external downloader if available for faster parallel segment downloads.
    args = [
      "-f", formatId,
      "--merge-output-format", "mp4",
      ...(ARIA2C_PATH
        ? ["--external-downloader", ARIA2C_PATH, "--external-downloader-args", "aria2c:-x5 -s5 -k1M"]
        : ["--concurrent-fragments", "5", "--buffer-size", "128K"]),
      "-o", outTemplate,
      "--no-playlist",
      url,
    ];
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn(YTDLP_PATH, [...BASE_ARGS, ...args], { timeout: 600000 });
      let stderr = "";

      proc.stdout.on("data", (_d: Buffer) => {
        // yt-dlp progress goes to stderr; stdout is unused when writing to file
      });
      proc.stderr.on("data", (d: Buffer) => {
        const line = d.toString();
        stderr += line;
        onStderr?.(line.trimEnd());
      });

      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(stderr.slice(-2000) || `yt-dlp exited with code ${code}`));
      });

      proc.on("error", (err) => {
        reject(new Error(`Failed to run yt-dlp: ${err.message}`));
      });
    });
  } finally {
    // Release the slot as soon as yt-dlp exits so the next queued download can start
    // (the file stream to the client happens independently)
    release();
  }

  // yt-dlp replaces %(ext)s — find the actual file
  const actualExt = isAudioMp3 ? "mp3" : isAudioM4a ? "m4a" : "mp4";
  const filePath = path.join(TMP_DIR, `ytsave_${id}.${actualExt}`);

  // Confirm the file exists
  await stat(filePath);

  const cleanup = async () => {
    await unlink(filePath).catch(() => {});
  };

  return { filePath, cleanup };
}
