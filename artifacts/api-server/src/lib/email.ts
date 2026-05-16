import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

export function createTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
}

export async function sendPasswordResetEmail(
  toEmail: string,
  code: string
): Promise<void> {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn("Email not configured — reset code:", code);
    return;
  }

  await transporter.sendMail({
    from: `"YTSave" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Your YTSave Password Reset Code",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0f0f13;color:#fff;border-radius:16px;">
        <h1 style="font-size:24px;font-weight:700;margin-bottom:8px;">Reset your password</h1>
        <p style="color:#9ca3af;margin-bottom:24px;">Use the code below to reset your YTSave password. It expires in 15 minutes.</p>
        <div style="background:#1c1c26;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#8b5cf6;">${code}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
