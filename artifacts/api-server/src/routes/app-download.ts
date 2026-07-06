import { Router } from "express";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import os from "os";

const router = Router();

const PLATFORMS = ["windows", "mac", "linux"] as const;
type Platform = (typeof PLATFORMS)[number];

const FILE_NAMES: Record<Platform, string> = {
  windows: "YTSave-Windows.tar.gz",
  mac: "YTSave-macOS.tar.gz",
  linux: "YTSave-Linux.tar.gz",
};

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
The desktop app runs yt-dlp on YOUR machine using YOUR browser cookies —
zero IP blocks and zero bot detection from YouTube or any other site.

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
  if (!fs.existsSync(electronDir)) {
    res.status(500).json({ error: "Desktop app source not found on server." });
    return;
  }

  // Write platform README to a temp file inside the electron dir so tar picks it up
  const readmeName = "HOW_TO_RUN.md";
  const readmePath = path.join(electronDir, readmeName);
  fs.writeFileSync(readmePath, buildReadme(platform));

  const filename = FILE_NAMES[platform];
  res.setHeader("Content-Type", "application/gzip");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  // tar excludes
  const excludeDirs = ["node_modules", "dist", "dist-app", ".git"];
  const excludeArgs = excludeDirs.flatMap((d) => ["--exclude", `./${d}`]);

  const tar = spawn("tar", [
    "-czf", "-",          // write gzip to stdout
    ...excludeArgs,
    "-C", electronDir,    // change to electron dir
    ".",                  // archive everything in it
  ]);

  tar.stdout.pipe(res);

  let stderrBuf = "";
  tar.stderr.on("data", (d: Buffer) => { stderrBuf += d.toString(); });

  tar.on("close", (code) => {
    fs.unlink(readmePath, () => {});
    if (code !== 0) {
      console.error("[app-download] tar error:", stderrBuf);
    }
  });

  tar.on("error", (err) => {
    fs.unlink(readmePath, () => {});
    console.error("[app-download] spawn error:", err);
    if (!res.headersSent) res.status(500).json({ error: "Failed to create archive." });
  });
});

export default router;
