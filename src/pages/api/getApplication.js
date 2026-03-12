import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  const { user_id } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM applications 
       WHERE user_id = $1 
       ORDER BY application_date DESC`,
      [user_id]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: err.message });
  }
}