import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const stats = await pool.query(
      `SELECT 
        COUNT(*) as total_certificates,
        COUNT(CASE WHEN file_path IS NOT NULL THEN 1 END) as issued_certificates,
        COUNT(CASE WHEN file_path IS NULL AND issue_date IS NOT NULL THEN 1 END) as pending_certificates,
        COUNT(CASE WHEN file_path IS NULL AND issue_date IS NULL THEN 1 END) as processing_certificates,
        COUNT(DISTINCT program_name) as unique_programs,
        MAX(issue_date) as latest_issue_date
       FROM certificates 
       WHERE user_id = $1`,
      [userId]
    );

    const programStats = await pool.query(
      `SELECT 
        program_name,
        COUNT(*) as certificate_count,
        COUNT(CASE WHEN file_path IS NOT NULL THEN 1 END) as issued_count
       FROM certificates 
       WHERE user_id = $1
       GROUP BY program_name
       ORDER BY certificate_count DESC`,
      [userId]
    );

    res.status(200).json({
      success: true,
      stats: {
        ...stats.rows[0],
        programs: programStats.rows
      }
    });
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}