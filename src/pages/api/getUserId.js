import { pool } from './db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Fetching user_id for email:', email);

    const result = await pool.query(
      'SELECT user_id FROM public.users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = result.rows[0].user_id;

    return res.status(200).json({ success: true, userId });
  } catch (error) {
    console.error('Error fetching user ID:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}



