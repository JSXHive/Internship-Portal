import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Count certificates with status 'issued' OR 'verified'
    const result = await pool.query(`
      SELECT COUNT(*) as certificate_count 
      FROM certificates 
      WHERE status IN ('issued', 'verified')
    `);

    const certificateCount = parseInt(result.rows[0].certificate_count) || 0;

    res.status(200).json({
      success: true,
      count: certificateCount,
      message: 'Certificate count retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching certificate count:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      count: 0
    });
  }
}