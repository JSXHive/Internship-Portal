// import { pool } from "./db.js";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { mentorId } = req.query;
    if (!mentorId) return res.status(400).json({ error: "Mentor ID required" });
    try {
      const result = await pool.query(
        `SELECT * FROM public.students WHERE mentor_id = $1`,
        [mentorId]
      );
      return res.status(200).json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
