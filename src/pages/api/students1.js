// pages/api/students.js
import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Assuming you have a students table or you want to get students from applications
  const result = await pool.query('SELECT DISTINCT user_id, full_name, email, mentor_id FROM applications');
  res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}