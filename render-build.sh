#!/usr/bin/env bash
set -e

echo "==> Installing pnpm..."
npm install -g pnpm

echo "==> Installing workspace dependencies..."
pnpm install --frozen-lockfile

echo "==> Building api-server..."
pnpm --filter @workspace/api-server run build

echo "==> Installing yt-dlp..."
pip3 install --upgrade yt-dlp

echo "==> Verifying yt-dlp installation..."
yt-dlp --version

echo "==> Build complete."
