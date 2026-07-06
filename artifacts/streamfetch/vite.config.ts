import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";

const rawPort = process.env.PORT ?? "3000";
const port = Number(rawPort);
const basePath = process.env.BASE_PATH ?? "/";

// Resolve the electron dist-app directory from the workspace root
const electronDistApp = path.resolve(import.meta.dirname, "../../artifacts/electron/dist-app");

function findBuiltFile(suffix: string): string | null {
  if (!fs.existsSync(electronDistApp)) return null;
  const files = fs.readdirSync(electronDistApp).filter((f) => f.endsWith(suffix));
  return files.length ? path.join(electronDistApp, files[0]) : null;
}

/** Plugin that serves pre-built desktop binaries directly from the vite
 *  preview server, so downloads work even when the API server is not running. */
const desktopDownloadPlugin = () => ({
  name: "desktop-download",
  configurePreviewServer(server: { middlewares: { use: Function } }) {
    server.middlewares.use((req: any, res: any, next: Function) => {
      const match = req.url?.match(/^\/api\/app\/download\/(windows|mac|linux)/);
      if (!match) return next();

      const platform = match[1] as "windows" | "mac" | "linux";

      if (platform === "windows") {
        const zip = findBuiltFile("-win.zip");
        if (zip) {
          const filename = path.basename(zip);
          res.setHeader("Content-Type", "application/zip");
          res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
          res.setHeader("Content-Length", fs.statSync(zip).size.toString());
          fs.createReadStream(zip).pipe(res);
          return;
        }
      }

      if (platform === "linux") {
        const appImage = findBuiltFile(".AppImage");
        if (appImage) {
          const filename = path.basename(appImage);
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
          res.setHeader("Content-Length", fs.statSync(appImage).size.toString());
          fs.createReadStream(appImage).pipe(res);
          return;
        }
      }

      if (platform === "mac") {
        const dmg = findBuiltFile(".dmg");
        if (dmg) {
          const filename = path.basename(dmg);
          res.setHeader("Content-Type", "application/octet-stream");
          res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
          res.setHeader("Content-Length", fs.statSync(dmg).size.toString());
          fs.createReadStream(dmg).pipe(res);
          return;
        }
      }

      // No pre-built binary found — let the proxy handle it (falls through to API server)
      next();
    });
  },
});

const noCachePlugin = () => ({
  name: "no-cache",
  configureServer(server: { middlewares: { use: Function } }) {
    server.middlewares.use((_req: any, res: any, next: Function) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      next();
    });
  },
  configurePreviewServer(server: { middlewares: { use: Function } }) {
    server.middlewares.use((_req: any, res: any, next: Function) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      next();
    });
  },
});

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    desktopDownloadPlugin(),
    noCachePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    hmr: false,
    watch: null,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT ?? "3001"}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT ?? "8080"}`,
        changeOrigin: true,
      },
    },
  },
});
