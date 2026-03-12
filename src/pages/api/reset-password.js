// pages/api/reset-password.js
// import { pool } from "../../../lib/db.js";
import { pool } from "@/lib/db";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token and password are required" });
  }

  try {
    // 1. Find user by token - FIXED: using user_id instead of id
    const userRes = await pool.query(
      "SELECT user_id, reset_token_expiry FROM public.users WHERE reset_token = $1",
      [token]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = userRes.rows[0];

    // 2. Check if token expired
    const now = new Date();
    if (user.reset_token_expiry < now) {
      return res.status(400).json({ error: "Token has expired" });
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update password and clear token - FIXED: using user_id instead of id
    await pool.query(
      "UPDATE public.users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2",
      [hashedPassword, user.user_id]
    );

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}