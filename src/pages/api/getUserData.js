import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id } = req.query;
 
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }
 
  try {
    const client = await pool.connect();
    try {
      const results = await client.query(
        'SELECT user_id, name, email, user_role, student_id, application_status FROM users WHERE user_id = $1',
        [user_id]
      );
     
      if (results.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
     
      const userData = results.rows[0];
      res.status(200).json(userData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
}