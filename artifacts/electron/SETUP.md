# YTSave Desktop App — Setup Guide

## Prerequisites

- **Node.js 20+** — https://nodejs.org
- **pnpm** — `npm install -g pnpm`
- **Git** — to clone the repo

## Quick Start (Development)

```bash
# 1. Clone and install
git clone <your-repo-url>
cd <repo-folder>
pnpm install

# 2. Build the API server and frontend
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/streamfetch run build

# 3. Run the desktop app
pnpm --filter @workspace/electron run dev
```

That's it. YTSave opens as a native desktop window. Downloads run on your own machine using your own IP — YouTube never blocks it.

## How It Works

- The Electron app automatically downloads `yt-dlp` to your app data folder on first launch
- It reads your existing browser cookies (Chrome, Firefox, Edge, etc.) so you're already authenticated with YouTube
- Everything runs locally — no server, no datacenter IP, no bot detection

## Build Installers

```bash
# Windows (.exe installer)
pnpm --filter @workspace/electron run dist:win

# macOS (.dmg)
pnpm --filter @workspace/electron run dist:mac

# Linux (AppImage)
pnpm --filter @workspace/electron run dist:linux
```

Installers are saved to `artifacts/electron/dist-app/`.

## Optional: MongoDB (for login/history features)

Without MongoDB, downloads work fine. To enable accounts and download history, add your MongoDB URI:

```bash
# Windows (PowerShell)
$env:MONGODB_URI="mongodb+srv://..."
pnpm --filter @workspace/electron run dev

# Mac/Linux
MONGODB_URI="mongodb+srv://..." pnpm --filter @workspace/electron run dev
```

## Troubleshooting

**"API server not built" error**
```bash
pnpm --filter @workspace/api-server run build
```

**yt-dlp download fails on first launch**
- Check your internet connection
- The binary is saved to your OS user data folder and reused on future launches

**YouTube still errors**
- Make sure you are logged into YouTube in Chrome or Firefox
- yt-dlp reads those cookies automatically
