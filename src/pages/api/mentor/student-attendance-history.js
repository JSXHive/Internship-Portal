import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { studentId, days = 30 } = req.query;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const result = await pool.query(`
      SELECT 
        a.*,
        u.student_id,
        u.name
      FROM attendance a
      INNER JOIN users u ON a.user_id = u.user_id
      WHERE a.user_id = $1 
      ORDER BY a.date DESC
      LIMIT $2
    `, [studentId, parseInt(days)]);

    res.status(200).json({ 
      success: true, 
      attendance: result.rows 
    });
  } catch (error) {
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}