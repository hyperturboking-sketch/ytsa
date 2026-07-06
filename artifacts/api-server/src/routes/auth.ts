import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { SignupBody, LoginBody } from "@workspace/api-zod";
import { generateToken, authMiddleware, type AuthRequest } from "../middlewares/auth.js";
import { sendPasswordResetEmail } from "../lib/email.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router: IRouter = Router();

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const parsed = SignupBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid signup data" });
      return;
    }
    const { username, email, password } = parsed.data;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? "Email" : "Username";
      res.status(409).json({ error: "Conflict", message: `${field} already taken` });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash, isAdmin: false });

    const token = generateToken(user._id.toString(), user.isAdmin);
    res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to create account" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation error", message: "Invalid login data" });
      return;
    }
    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString(), user.isAdmin);
    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error", message: "Login failed" });
  }
});

// POST /auth/logout
router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

// POST /auth/google
router.post("/google", async (req, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      res.status(400).json({ error: "Bad request", message: "Missing Google access token" });
      return;
    }

    const tokenInfo = await googleClient.getTokenInfo(accessToken);
    if (!tokenInfo.email) {
      res.status(400).json({ error: "Bad request", message: "Invalid Google token" });
      return;
    }

    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userinfo = await userinfoRes.json() as { email: string; name?: string; picture?: string; sub: string };

    const { email, name, picture, sub: googleId } = userinfo;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    } else {
      const baseUsername = (name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase().slice(0, 20);
      let username = baseUsername;
      let suffix = 1;
      while (await User.exists({ username })) {
        username = `${baseUsername}${suffix++}`;
      }
      user = await User.create({
        username,
        email,
        passwordHash: "",
        googleId,
        avatar: picture,
        isAdmin: false,
      });
    }

    const token = generateToken(user._id.toString(), user.isAdmin);
    res.json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ error: "Internal server error", message: "Google sign in failed" });
  }
});

// GET /auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ error: "Not found", message: "User not found" });
      return;
    }
    res.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Bad request", message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.json({ message: "If an account exists with that email, a reset code has been sent." });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordReset.deleteMany({ email: email.toLowerCase().trim() });
    await PasswordReset.create({ email: email.toLowerCase().trim(), code, expiresAt });

    await sendPasswordResetEmail(email, code);

    res.json({ message: "If an account exists with that email, a reset code has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to process request" });
  }
});

// POST /auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      res.status(400).json({ error: "Bad request", message: "Email, code and new password are required" });
      return;
    }
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      res.status(400).json({ error: "Bad request", message: "Password must be at least 6 characters" });
      return;
    }

    const record = await PasswordReset.findOne({
      email: email.toLowerCase().trim(),
      code: code.trim(),
    });

    if (!record) {
      res.status(400).json({ error: "Bad request", message: "Invalid or expired reset code" });
      return;
    }

    if (record.expiresAt < new Date()) {
      await PasswordReset.deleteOne({ _id: record._id });
      res.status(400).json({ error: "Bad request", message: "Reset code has expired. Please request a new one." });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await User.updateOne({ email: email.toLowerCase().trim() }, { passwordHash });
    await PasswordReset.deleteOne({ _id: record._id });

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Internal server error", message: "Failed to reset password" });
  }
});

export default router;
