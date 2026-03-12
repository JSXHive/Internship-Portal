// pages/api/getuser.js
import { pool } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // user_id is TEXT/VARCHAR in DB
    const result = await pool.query(
      'SELECT user_id, name, email FROM public.users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('GetUser error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}