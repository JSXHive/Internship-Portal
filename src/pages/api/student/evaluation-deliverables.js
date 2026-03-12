// pages/api/student/evaluation-deliverables.js
import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    const query = `
      SELECT 
        d.*,
        u.name as reviewer_name
      FROM deliverables d
      LEFT JOIN users u ON d.reviewed_by = u.user_id
      WHERE d.student_id = $1 OR d.user_id = $1
      ORDER BY d.submission_date DESC
    `;

    const result = await pool.query(query, [studentId]);
    
    res.status(200).json(result.rows); // Return as array directly
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}