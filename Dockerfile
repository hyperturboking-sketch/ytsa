FROM node:24-slim

RUN apt-get update && apt-get install -y \
  python3 python3-pip curl ffmpeg \
  && pip3 install --break-system-packages yt-dlp \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/streamfetch/ ./artifacts/streamfetch/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @workspace/streamfetch run build

RUN pnpm --filter @workspace/api-server run build

ENV NODE_ENV=production
ENV PORT=8080
ENV YTDLP_PATH=/usr/local/bin/yt-dlp

EXPOSE 8080

CMD ["node", "artifacts/api-server/dist/index.cjs"]
