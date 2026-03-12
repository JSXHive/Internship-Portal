import { pool } from "./db.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userId, contact, designation, expertise, profilePhotoUrl } = req.body;
    if (!userId || !contact || !designation || !expertise) {
      return res.status(400).json({ error: "All fields are required" });
    }
    try {
      await pool.query(
        `INSERT INTO public.mentors (mentor_id, contact, designation, expertise, profile_photo)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (mentor_id) DO UPDATE SET contact = $2, designation = $3, expertise = $4, profile_photo = $5`,
        [userId, contact, designation, expertise, profilePhotoUrl || null]
      );
      return res.status(201).json({ message: "Mentor profile saved" });
    } catch (err) {
      console.error("Mentor profile error:", err);
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  } else if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID required" });
    try {
      const result = await pool.query(
        `SELECT * FROM public.mentors WHERE mentor_id = $1`,
        [userId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Mentor not found" });
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
