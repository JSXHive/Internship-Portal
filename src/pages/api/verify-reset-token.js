import { pool } from "./db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  try {
    // Check if token is valid and not expired
    const tokenCheck = await pool.query(
      `SELECT email FROM public.users 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (tokenCheck.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const email = tokenCheck.rows[0].email;

    return res.status(200).json({
      message: "Valid reset token",
      email: email
    });

  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}