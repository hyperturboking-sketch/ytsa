import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import videoRouter from "./video.js";
import userRouter from "./user.js";
import adminRouter from "./admin.js";
import paymentsRouter from "./payments.js";
import transcribeRouter from "./transcribe.js";
import subtitlesRouter from "./subtitles.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use(videoRouter);
router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/payments", paymentsRouter);
router.use(transcribeRouter);
router.use(subtitlesRouter);

export default router;
