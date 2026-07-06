import { Router } from "express";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import os from "os";

const router = Router();

const PLATFORMS = ["windows", "mac", "linux"] as const;
type Platform = (typeof PLATFORMS)[number];

function findElectronDir(): string {
  const candidates = [
    path.resolve("/home/runner/workspace/artifacts/electron"),
    path.resolve(process.cwd(), "artifacts/electron"),
    path.resolve(process.cwd(), "../../artifacts/electron"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

function findBuiltFile(electronDir: string, suffix: string): string | null {
  const distApp = path.join(electronDir, "dist-app");
  if (!fs.existsSync(distApp)) return null;
  const files = fs.readdirSync(distApp).filter((f) => f.endsWith(suffix));
  if (!files.length) return null;
  return path.join(distApp, files[0]);
}

function buildReadme(platform: Platform): string {
  const cmds: Record<Platform, { prereq: string; dist: string }> = {
    windows: {
      prereq: "1. Install Node.js 20+ from https://nodejs.org\n2. In PowerShell: npm install -g pnpm",
      dist: "pnpm run dist:win",
    },
    mac: {
      prereq: "1. Install Node.js 20+ from https://nodejs.org\n2. In Terminal: npm install -g pnpm",
      dist: "pnpm run dist:mac",
    },
    linux: {
      prereq: "1. Install Node.js 20+ (nvm or your distro)\n2. npm install -g pnpm",
      dist: "pnpm run dist:linux",
    },
  };
  const c = cmds[platform];
  return `# YTSave Desktop App

## Prerequisites
${c.prereq}

## Run the app
\`\`\`
pnpm install
pnpm run dev
\`\`\`

## Why desktop?
The desktop app runs yt-dlp on YOUR machine using YOUR browser cookies.
Zero IP blocks, zero bot detection from YouTube or any other site.

## Build a distributable installer
\`\`\`
${c.dist}
\`\`\`
The installer will appear in the dist-app/ folder.

---
See SETUP.md for more details.
`;
}

router.get("/app/download/:platform", (req, res) => {
  const platform = req.params.platform as Platform;
  if (!PLATFORMS.includes(platform)) {
    res.status(400).json({ error: "Unknown platform. Use: windows, mac, linux" });
    return;
  }

  const electronDir = findElectronDir();

  // Linux — serve the pre-built AppImage directly
  if (platform === "linux") {
    const appImage = findBuiltFile(electronDir, ".AppImage");
    if (appImage && fs.existsSync(appImage)) {
      const filename = path.basename(appImage);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", fs.statSync(appImage).size.toString());
      fs.createReadStream(appImage).pipe(res);
      return;
    }
  }

  // Windows — serve the NSIS installer (.exe) if available, else fall back to zip
  if (platform === "windows") {
    const distApp = path.join(electronDir, "dist-app");
    const setupExe = fs.existsSync(distApp)
      ? fs.readdirSync(distApp).find((f) => f.includes("-Setup-") && f.endsWith(".exe"))
      : null;
    if (setupExe) {
      const fullPath = path.join(distApp, setupExe);
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${setupExe}"`);
      res.setHeader("Content-Length", fs.statSync(fullPath).size.toString());
      fs.createReadStream(fullPath).pipe(res);
      return;
    }
    const winZip = findBuiltFile(electronDir, "-win.zip");
    if (winZip && fs.existsSync(winZip)) {
      const filename = path.basename(winZip);
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", fs.statSync(winZip).size.toString());
      fs.createReadStream(winZip).pipe(res);
      return;
    }
  }

  // Windows / Mac — serve source code as tar.gz with instructions
  if (!fs.existsSync(electronDir)) {
    res.status(500).json({ error: "Desktop app source not found on server." });
    return;
  }

  const FILE_NAMES: Record<Platform, string> = {
    windows: "YTSave-Windows-Source.tar.gz",
    mac: "YTSave-macOS-Source.tar.gz",
    linux: "YTSave-Linux-Source.tar.gz",
  };

  const filename = FILE_NAMES[platform];
  const readmePath = path.join(electronDir, "HOW_TO_RUN.md");
  fs.writeFileSync(readmePath, buildReadme(platform));

  const excludeDirs = ["node_modules", "dist", "dist-app", ".git"];
  const excludeArgs = excludeDirs.flatMap((d) => ["--exclude", `./${d}`]);

  res.setHeader("Content-Type", "application/gzip");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const tar = spawn("tar", ["-czf", "-", ...excludeArgs, "-C", electronDir, "."]);
  tar.stdout.pipe(res);

  let stderrBuf = "";
  tar.stderr.on("data", (d: Buffer) => { stderrBuf += d.toString(); });
  tar.on("close", (code) => {
    fs.unlink(readmePath, () => {});
    if (code !== 0) console.error("[app-download] tar error:", stderrBuf);
  });
  tar.on("error", (err) => {
    fs.unlink(readmePath, () => {});
    console.error("[app-download] spawn error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to create archive." });
  });
});

export default router;
