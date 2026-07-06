# StreamFetch Workspace

## Overview

StreamFetch is a full-stack video and audio downloader web application. Users paste a video URL (YouTube, Twitter, TikTok, etc.) and can download media in various formats and resolutions.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Video extraction**: yt-dlp (binary at `/home/runner/.local/bin/yt-dlp`)
- **Authentication**: JWT (jsonwebtoken + bcryptjs)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── streamfetch/        # React + Vite frontend (served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Key Features

1. **Video Analysis** - Paste any URL, backend uses yt-dlp to fetch metadata and available formats
2. **Format Selection** - Choose from 1080p/720p/480p MP4 or Audio MP3/M4A
3. **Streaming Downloads** - Backend streams downloads via yt-dlp without saving to disk
4. **User Authentication** - JWT-based signup/login/logout
5. **Download History** - Logged-in users see their download history on dashboard
6. **Admin Panel** - Stats, user management, download activity (admin-only)
7. **Ad Placeholders** - Ready-to-use components for Google AdSense

## Database Schema

### users
- id, username, email, password_hash, is_admin, created_at

### downloads
- id, user_id, video_title, video_url, selected_format, thumbnail, created_at

## API Endpoints

- `GET /api/healthz` - Health check
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user (auth required)
- `POST /api/analyze` - Analyze video URL, returns formats
- `POST /api/download` - Stream download in selected format
- `GET /api/user/history` - User download history (auth required)
- `GET /api/admin/stats` - Admin statistics (admin only)
- `GET /api/admin/users` - List all users (admin only)
- `GET /api/admin/downloads` - Recent downloads (admin only)

## Important Notes

- yt-dlp binary is at `/home/runner/.local/bin/yt-dlp` (set YTDLP_PATH env var to override)
- JWT secret defaults to a dev value — set `JWT_SECRET` env var in production
- ffmpeg is available at `/nix/store/.../bin/ffmpeg` (in PATH via replit-runtime)
- Admin user can be created by manually setting `is_admin = true` in the database
- Default admin account: admin@streamfetch.com / admin123 (is_admin = true in DB)

## Replit Workflows

Two workflows run the project:
- **API Server** — Express backend on `PORT=$API_PORT` (3001 by default), console output
- **Start application** — Vite frontend on `PORT` (5000 by default), webview output

The Vite dev server proxies `/api/*` requests to the API server at `localhost:$API_PORT`, so no `VITE_API_BASE_URL` env var is needed in development.

## Environment Variables

| Variable | Environment | Description |
|---|---|---|
| `MONGODB_URI` | shared | MongoDB Atlas connection string |
| `PORT` | shared | Frontend Vite port (5000) |
| `API_PORT` | shared | API server port (3001) |
| `JWT_SECRET` | shared | JWT signing secret (optional, has dev default) |
| `ALLOWED_ORIGIN` | shared | Allowed CORS origin (empty = allow all) |

## Development

```bash
# Install dependencies
pnpm install

# Run API server
PORT=$API_PORT pnpm --filter @workspace/api-server run dev

# Run frontend
pnpm --filter @workspace/streamfetch run dev

# Push DB schema
pnpm --filter @workspace/db run push

# Run codegen
pnpm --filter @workspace/api-spec run codegen
```
