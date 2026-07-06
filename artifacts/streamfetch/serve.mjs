import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 18301);
const distDir = path.resolve(__dirname, "dist/public");
const electronDist = path.resolve(__dirname, "../../artifacts/electron/dist-app");

function findFile(contains, endsWith) {
  if (!fs.existsSync(electronDist)) return null;
  const match = fs.readdirSync(electronDist).find(
    (f) => f.includes(contains) && f.endsWith(endsWith)
  );
  return match ? path.join(electronDist, match) : null;
}

function streamFile(filePath, mime, res) {
  const stat = fs.statSync(filePath);
  res.setHeader("Content-Type", mime);
  res.setHeader("Content-Disposition", `attachment; filename="${path.basename(filePath)}"`);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Accept-Ranges", "bytes");
  fs.createReadStream(filePath).pipe(res);
}

const app = express();

// ── Download routes (must come BEFORE static file serving) ──────────────────
// express.static blocks symlinks pointing outside its root, so we serve
// pre-built binaries with explicit routes instead.

app.get("/downloads/YTSave-Setup.exe", (_req, res) => {
  const exe = findFile("-Setup-", ".exe");
  if (exe) return streamFile(exe, "application/octet-stream", res);
  // Fallback: portable zip renamed to .exe won't work, so 404
  res.status(404).json({ error: "Windows installer not built yet." });
});

app.get("/downloads/YTSave-Windows.zip", (_req, res) => {
  const zip = findFile("", "-win.zip");
  if (zip) return streamFile(zip, "application/zip", res);
  res.status(404).json({ error: "Windows zip not found." });
});

app.get("/downloads/YTSave-Linux.AppImage", (_req, res) => {
  const img = findFile("", ".AppImage");
  if (img) return streamFile(img, "application/octet-stream", res);
  res.status(404).json({ error: "Linux AppImage not found." });
});

app.get("/downloads/YTSave-macOS.dmg", (_req, res) => {
  const dmg = findFile("", ".dmg");
  if (dmg) return streamFile(dmg, "application/octet-stream", res);
  res.status(404).json({ error: "macOS DMG not found." });
});

// ── Static frontend ──────────────────────────────────────────────────────────
app.use(express.static(distDir));

// SPA fallback
app.get("*", (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`StreamFetch on http://0.0.0.0:${port}`);
  // Log which binaries are available
  for (const [label, [contains, ext]] of [
    ["Windows .exe", ["-Setup-", ".exe"]],
    ["Windows .zip", ["", "-win.zip"]],
    ["Linux AppImage", ["", ".AppImage"]],
  ]) {
    const f = findFile(contains, ext);
    console.log(`  ${label}: ${f ? path.basename(f) : "not found"}`);
  }
});
