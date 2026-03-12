// pages/api/request-reset.js
import { pool } from "../../lib/db.js";
import crypto from "crypto";
import sendEmail from "../../lib/sendEmail.js"; // your email function

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    // 1. Lookup user by email only
    const userRes = await pool.query(
      "SELECT id FROM public.users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "No user found with this email" });
    }

    const user = userRes.rows[0];

    // 2. Generate unique token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    // 3. Save token and expiry in DB
    await pool.query(
      "UPDATE public.users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3",
      [token, expiry, user.id]
    );

    // 4. Send email
    const resetLink = `https://yourapp.com/reset-password?token=${token}`;
    await sendEmail(
      email,
      "Password Reset",
      `Click the link below to reset your password:\n\n${resetLink}\n\nLink expires in 1 hour.`
    );

    return res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Request reset error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
