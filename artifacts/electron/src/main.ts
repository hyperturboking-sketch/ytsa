import { app, BrowserWindow, shell, dialog, nativeImage } from "electron";
import { spawn, ChildProcess, execSync } from "child_process";
import { existsSync, mkdirSync, chmodSync, writeFileSync } from "fs";
import { createWriteStream } from "fs";
import * as https from "https";
import * as http from "http";
import * as net from "net";
import * as path from "path";
import * as os from "os";

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let serverPort = 0;

// ─── Path helpers ────────────────────────────────────────────────────────────

const isDev = !app.isPackaged;

/**
 * In dev: repo root is 3 levels up from artifacts/electron/dist/main.js
 * In prod: paths are relative to process.resourcesPath
 */
function repoPath(...parts: string[]): string {
  if (isDev) {
    return path.join(__dirname, "..", "..", "..", ...parts);
  }
  return path.join(process.resourcesPath, ...parts);
}

function ytdlpBinaryPath(): string {
  const dir = app.getPath("userData");
  const name = process.platform === "win32" ? "yt-dlp.exe" : "yt-dlp";
  return path.join(dir, name);
}

// ─── yt-dlp downloader ───────────────────────────────────────────────────────

function ytdlpDownloadUrl(): string {
  const plat = process.platform;
  const arch = process.arch;
  if (plat === "win32") return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
  if (plat === "darwin") return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
  // Linux: prefer arm64 if applicable
  if (arch === "arm64") return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux_aarch64";
  return "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);

    const handleResponse = (res: http.IncomingMessage) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
      file.on("error", reject);
    };

    proto.get(url, handleResponse).on("error", (err) => {
      file.close();
      reject(err);
    });
  });
}

async function ensureYtDlp(onStatus: (msg: string) => void): Promise<string> {
  const dest = ytdlpBinaryPath();

  if (existsSync(dest)) {
    onStatus("Updating yt-dlp...");
    try {
      await downloadFile(ytdlpDownloadUrl(), dest);
      if (process.platform !== "win32") chmodSync(dest, 0o755);
      onStatus("yt-dlp updated.");
    } catch {
      onStatus("yt-dlp update skipped (using cached).");
    }
  } else {
    onStatus("Downloading yt-dlp...");
    mkdirSync(path.dirname(dest), { recursive: true });
    await downloadFile(ytdlpDownloadUrl(), dest);
    if (process.platform !== "win32") chmodSync(dest, 0o755);
    onStatus("yt-dlp ready.");
  }

  return dest;
}

// ─── Free port finder ────────────────────────────────────────────────────────

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as net.AddressInfo;
      server.close(() => resolve(addr.port));
    });
    server.on("error", reject);
  });
}

// ─── API server launcher ─────────────────────────────────────────────────────

function startApiServer(port: number, ytdlpPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const apiServerDir = repoPath("artifacts", "api-server");
    const entryPoint = path.join(apiServerDir, "dist", "index.cjs");

    if (!existsSync(entryPoint)) {
      reject(new Error(
        `API server not built. Please run:\n  pnpm --filter @workspace/api-server run build\n\nThen restart YTSave.`
      ));
      return;
    }

    serverProcess = spawn(process.execPath, [entryPoint], {
      cwd: apiServerDir,
      env: {
        ...process.env,
        PORT: String(port),
        NODE_ENV: "production",
        ELECTRON_RUN: "true",
        YTDLP_PATH: ytdlpPath,
        // JWT secret — generate a random one per install if not set
        JWT_SECRET: process.env.JWT_SECRET || randomHex(32),
      },
    });

    const timeout = setTimeout(() => {
      reject(new Error("Server startup timed out after 30 seconds."));
    }, 30000);

    serverProcess.stdout?.on("data", (data: Buffer) => {
      const text = data.toString();
      console.log("[server]", text.trim());
      if (text.includes("listening on port")) {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr?.on("data", (data: Buffer) => {
      console.error("[server-err]", data.toString().trim());
    });

    serverProcess.on("error", (err) => {
      clearTimeout(timeout);
      reject(new Error(`Failed to start server: ${err.message}`));
    });

    serverProcess.on("exit", (code) => {
      if (code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}`));
      }
    });
  });
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  return Buffer.from(arr).toString("hex");
}

// ─── Window helpers ──────────────────────────────────────────────────────────

function createSplashWindow(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 480,
    height: 300,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: "#0f0f13",
    webPreferences: { nodeIntegration: false },
    show: false,
  });

  // Inline HTML splash screen
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: #0f0f13;
    color: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    gap: 16px;
    user-select: none;
    -webkit-app-region: drag;
  }
  .logo { font-size: 3rem; }
  h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.03em; }
  p { font-size: 0.8rem; color: #888; margin-top: -8px; }
  .status {
    font-size: 0.75rem;
    color: #7c6fff;
    margin-top: 8px;
    min-height: 1.2em;
    text-align: center;
  }
  .bar-wrap {
    width: 200px; height: 3px;
    background: #222; border-radius: 9999px; overflow: hidden;
  }
  .bar {
    height: 100%; width: 30%;
    background: linear-gradient(90deg, #7c6fff, #a78bfa);
    border-radius: 9999px;
    animation: slide 1.2s ease-in-out infinite alternate;
  }
  @keyframes slide { from { margin-left: 0%; } to { margin-left: 70%; } }
</style>
</head>
<body>
  <div class="logo">⬇️</div>
  <h1>YTSave</h1>
  <p>Desktop Edition</p>
  <div class="bar-wrap"><div class="bar"></div></div>
  <div class="status" id="s">Starting up...</div>
  <script>
    const { ipcRenderer } = require("electron");
  </script>
</body>
</html>`;

  const tmpFile = path.join(os.tmpdir(), "ytsave-splash.html");
  writeFileSync(tmpFile, html);
  splash.loadFile(tmpFile);
  splash.once("ready-to-show", () => splash.show());
  return splash;
}

async function createMainWindow(port: number): Promise<BrowserWindow> {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#0f0f13",
    show: false,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Open external links in the system browser, not in the app window
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const parsed = new URL(url);
    if (parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1") {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  await mainWindow.loadURL(`http://127.0.0.1:${port}`);

  mainWindow.on("closed", () => { mainWindow = null; });
  return mainWindow;
}

// ─── App lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  const splash = createSplashWindow();

  const updateStatus = (msg: string) => {
    console.log(msg);
    // Send to splash if still open
    if (!splash.isDestroyed()) {
      splash.webContents.executeJavaScript(
        `document.getElementById('s').textContent = ${JSON.stringify(msg)}`
      ).catch(() => {});
    }
  };

  try {
    updateStatus("Preparing yt-dlp...");
    const ytdlpPath = await ensureYtDlp(updateStatus);

    updateStatus("Finding port...");
    serverPort = await findFreePort();

    updateStatus("Starting local server...");
    await startApiServer(serverPort, ytdlpPath);

    updateStatus("Loading app...");
    const win = await createMainWindow(serverPort);

    win.once("ready-to-show", () => {
      win.show();
      win.focus();
      if (!splash.isDestroyed()) splash.close();
    });

  } catch (err: any) {
    if (!splash.isDestroyed()) splash.close();
    const msg = err instanceof Error ? err.message : String(err);
    await dialog.showErrorBox("YTSave failed to start", msg);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", async () => {
  if (!mainWindow && serverPort) {
    const win = await createMainWindow(serverPort);
    win.once("ready-to-show", () => { win.show(); win.focus(); });
  }
});

app.on("will-quit", () => {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    setTimeout(() => serverProcess?.kill("SIGKILL"), 3000);
  }
});
