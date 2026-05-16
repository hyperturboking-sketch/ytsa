import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import app from "./app";

const YTDLP_PATH = process.env.YTDLP_PATH || "/home/runner/.local/bin/yt-dlp";

function ensureYtDlp() {
  if (existsSync(YTDLP_PATH)) return;
  console.log("yt-dlp not found, downloading...");
  try {
    const dir = YTDLP_PATH.substring(0, YTDLP_PATH.lastIndexOf("/"));
    mkdirSync(dir, { recursive: true });
    execSync(
      `curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o "${YTDLP_PATH}" && chmod +x "${YTDLP_PATH}"`,
      { stdio: "inherit", timeout: 60000 }
    );
    console.log("yt-dlp downloaded successfully.");
  } catch (e) {
    console.error("Failed to download yt-dlp:", e);
  }
}

ensureYtDlp();

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
