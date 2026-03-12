// import { pool } from '../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      'SELECT mentor, start_date, end_date FROM applications WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}