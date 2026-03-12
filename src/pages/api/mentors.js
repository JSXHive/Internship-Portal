import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    // Return both user_id and name for each mentor
  const result = await pool.query('SELECT user_id AS id, name, email FROM mentor_profiles');
  res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mentors', details: err.message });
  }
}
