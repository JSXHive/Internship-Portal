import { pool } from "../../../lib/db.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 1️⃣ Check if user exists
    const userCheck = await pool.query(
      "SELECT user_id, name FROM public.users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(200).json({
        message:
          "If an account exists with this email, you will receive a password reset link shortly.",
      });
    }

    const user = userCheck.rows[0];

    // 2️⃣ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // 3️⃣ Store token and expiry in DB
    await pool.query(
      "UPDATE public.users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3",
      [resetToken, resetTokenExpiry, user.user_id]
    );

    // 4️⃣ Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    // 5️⃣ Configure Nodemailer with TLS settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // This bypasses the certificate validation
      },
    });

    // 6️⃣ Send email
    await transporter.sendMail({
      from: `"Internship Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `<p>Hi ${user.name},</p>
             <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
             <p><a href="${resetLink}">${resetLink}</a></p>
             <p>If you did not request a password reset, ignore this email.</p>`,
    });

    return res.status(200).json({
      message:
        "If an account exists with this email, you will receive a password reset link shortly.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}