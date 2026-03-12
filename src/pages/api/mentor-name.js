// import { pool } from '../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ error: 'Mentor ID is required' });
  }

  try {
    // Query the mentor_profiles table to get the mentor name
    const result = await pool.query(
      'SELECT name FROM mentor_profiles WHERE user_id = $1',
      [mentorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.status(200).json({ name: result.rows[0].name });
  } catch (error) {
    console.error('Error fetching mentor name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}