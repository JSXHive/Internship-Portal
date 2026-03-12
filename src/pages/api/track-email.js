// pages/api/track-email.js
import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, subject, content } = req.body;
    
    if (!userId || !subject || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO mentor_emails (student_id, subject, content, direction, created_at)
       VALUES ($1, $2, $3, 'sent', NOW())
       RETURNING *`,
      [userId, subject, content]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error tracking email:', error);
    res.status(500).json({ error: 'Failed to track email' });
  }
}