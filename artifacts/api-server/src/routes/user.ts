import { Router, type IRouter } from "express";
import { Download } from "../models/Download.js";
import { authMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

// GET /user/history
router.get("/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const downloads = await Download.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      downloads: downloads.map((d) => ({
        id: d._id.toString(),
        videoTitle: d.videoTitle,
        videoUrl: d.videoUrl,
        selectedFormat: d.selectedFormat,
        thumbnail: d.thumbnail,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
