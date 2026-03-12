import { compare } from "bcryptjs";
import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const emailCheck = await pool.query(
      `SELECT user_id, user_role, name, email, password
       FROM public.users 
       WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length === 0) {
      return res.status(404).json({ error: "Account not found. Please sign up first." });
    }

    const user = emailCheck.rows[0];
    let validPassword = false;

    // ✅ First try bcrypt compare
    try {
      validPassword = await compare(password, user.password);
    } catch {
      validPassword = false;
    }

    // ✅ If bcrypt fails, fallback to plain text check
    if (!validPassword && user.password === password) {
      validPassword = true;
    }

    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    return res.status(200).json({
      message: "Login successful",
      userId: user.user_id,  // ✅ keep consistent
      role: user.user_role?.toLowerCase(),
      name: user.name,
      email: user.email,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}