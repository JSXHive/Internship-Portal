// pages/api/applications.js
import { pool } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    const result = await pool.query('SELECT * FROM applications');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}