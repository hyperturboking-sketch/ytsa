import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import app from "./app";

const YTDLP_PATH = process.env.YTDLP_PATH || "/home/runner/.local/bin/yt-dlp";

function ensureYtDlp() {
  const alreadyExists = existsSync(YTDLP_PATH);
  if (!alreadyExists) {
    console.log("yt-dlp not found, downloading...");
  } else {
    console.log("yt-dlp found, updating to latest...");
  }
  try {
    const dir = YTDLP_PATH.substring(0, YTDLP_PATH.lastIndexOf("/"));
    mkdirSync(dir, { recursive: true });
    execSync(
      `curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o "${YTDLP_PATH}" && chmod +x "${YTDLP_PATH}"`,
      { stdio: "inherit", timeout: 90000 }
    );
    console.log("yt-dlp ready (latest version).");
  } catch (e) {
    if (!alreadyExists) {
      console.error("Failed to download yt-dlp:", e);
    } else {
      console.warn("yt-dlp update failed, using existing binary.");
    }
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
