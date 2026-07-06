#!/usr/bin/env bash
set -e

# Always run from the repo root (parent of this script's directory)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

APP_NAME="${FLY_APP_NAME:-streamfetch}"

echo "==> Working directory: $ROOT_DIR"
echo "==> App name: $APP_NAME"

echo "==> Checking flyctl..."
if ! command -v flyctl &>/dev/null; then
  echo "Installing flyctl..."
  curl -L https://fly.io/install.sh | sh
  export PATH="$HOME/.fly/bin:$PATH"
fi

echo "==> Creating app (skipped if already exists)..."
flyctl apps create "$APP_NAME" 2>/dev/null || true

echo "==> Importing secrets from current environment..."
printf '%s\n' \
  "MONGODB_URI=${MONGODB_URI}" \
  "JWT_SECRET=${JWT_SECRET}" \
  "GROQ_API_KEY=${GROQ_API_KEY}" \
  "EMAIL_USER=${EMAIL_USER}" \
  "EMAIL_PASS=${EMAIL_PASS}" \
  "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}" \
  "NOWPAYMENTS_API_KEY=${NOWPAYMENTS_API_KEY}" \
  "NOWPAYMENTS_IPN_SECRET=${NOWPAYMENTS_IPN_SECRET}" \
  "ALLOWED_ORIGIN=${ALLOWED_ORIGIN:-}" \
  | grep -v '=$' \
  | flyctl secrets import --app "$APP_NAME"

echo "==> Deploying to Fly.io..."
flyctl deploy --config "$ROOT_DIR/fly.toml" --app "$APP_NAME" --remote-only

echo ""
echo "Done! Your app is live at: https://${APP_NAME}.fly.dev"
