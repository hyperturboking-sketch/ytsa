import { Router, type IRouter } from "express";
import { User } from "../models/User.js";
import { Download } from "../models/Download.js";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.use(authMiddleware, adminMiddleware);

// GET /admin/stats
router.get("/stats", async (_req: AuthRequest, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalUsers, totalDownloads, recentDownloads, recentUsers] = await Promise.all([
      User.countDocuments(),
      Download.countDocuments(),
      Download.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    res.json({ totalUsers, totalDownloads, recentDownloads, recentUsers });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/users
router.get("/users", async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100).lean();

    const userIds = users.map((u) => u._id);
    const downloadCounts = await Download.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(downloadCounts.map((d) => [d._id.toString(), d.count]));

    res.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin,
        downloadCount: countMap.get(u._id.toString()) || 0,
        createdAt: u.createdAt,
      })),
    });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/downloads
router.get("/downloads", async (_req, res) => {
  try {
    const downloads = await Download.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate<{ userId: { username: string } | null }>("userId", "username")
      .lean();

    res.json({
      downloads: downloads.map((d) => ({
        id: d._id.toString(),
        videoTitle: d.videoTitle,
        videoUrl: d.videoUrl,
        selectedFormat: d.selectedFormat,
        username: d.userId && typeof d.userId === "object" ? (d.userId as { username: string }).username : null,
        createdAt: d.createdAt,
      })),
    });
  } catch (err) {
    console.error("Admin downloads error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
