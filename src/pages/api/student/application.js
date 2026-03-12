// pages/api/student/application.js
import { query } from '../../../../lib/db';

export default async function handler(req, res) {
  const { userId } = req.query;
  
  try {
    const results = await query(
      `SELECT * FROM applications WHERE user_id = $1`,
      [userId]
    );
    
    if (results.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.status(200).json(results.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}