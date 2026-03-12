// pages/api/certificates/count.js
import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Query to count all certificates in your certificates table
    const result = await pool.query('SELECT COUNT(*) AS count FROM certificates');
    
    return res.status(200).json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching certificates count:', error);
    
    // Handle specific error cases
    if (error.message.includes('relation "certificates" does not exist')) {
      return res.status(200).json({ count: 0 });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}