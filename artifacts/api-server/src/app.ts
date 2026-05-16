import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import { connectDB } from "./lib/mongodb.js";
import path from "path";
import { fileURLToPath } from "url";

const app: Express = express();

app.set("trust proxy", 1);

const allowedOrigin = process.env.ALLOWED_ORIGIN;

app.use(cors({
  origin: allowedOrigin ? allowedOrigin : true,
  credentials: true,
}));

// Compress all responses (JSON, HTML, etc.) — big win for API responses
app.use(compression());

// Hard 30 s timeout for all routes except analyze/download which manage their own timeouts
app.use((req: Request, res: Response, next: NextFunction) => {
  const isLongOp = req.path.startsWith("/api/analyze") || req.path.startsWith("/api/download");
  if (!isLongOp) {
    res.setTimeout(30000, () => {
      if (!res.headersSent) res.status(503).json({ error: "Request timeout" });
    });
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  skip: (req) => req.path.startsWith("/auth"),
  message: { error: "Too many requests", message: "Please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests", message: "Too many login attempts, please try again later" },
});

const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: "Too many requests", message: "Too many analysis requests, please try again later" },
});

const downloadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests", message: "Too many download requests, please try again later" },
});

app.use("/api/auth", authLimiter);
app.use("/api", generalLimiter);
app.use("/api/analyze", analyzeLimiter);
app.use("/api/download", downloadLimiter);

app.use("/api", router);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const frontendDist = path.resolve(__dirname, "../../streamfetch/dist/public");

  app.use(express.static(frontendDist));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// Connect to MongoDB (optional — core analyze/download routes work without it)
connectDB().catch((err) => {
  console.warn("MongoDB unavailable, user/auth features disabled:", err.message);
});

export default app;
