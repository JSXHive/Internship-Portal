import { pool } from "./db.js";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { mentorId, studentId, title, description, dueDate } = req.body;
    if (!mentorId || !studentId || !title) {
      return res.status(400).json({ error: "All fields are required" });
    }
    try {
      await pool.query(
        `INSERT INTO public.tasks (mentor_id, student_id, title, description, due_date)
         VALUES ($1, $2, $3, $4, $5)`,
        [mentorId, studentId, title, description || "", dueDate || null]
      );
      return res.status(201).json({ message: "Task assigned" });
    } catch (err) {
      return res.status(500).json({ error: "Server error", details: err.message });
    }
  } else if (req.method === "GET") {
    const { mentorId } = req.query;
    if (!mentorId) return res.status(400).json({ error: "Mentor ID required" });
    try {
      const result = await pool.query(
        `SELECT * FROM public.tasks WHERE mentor_id = $1`,
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
