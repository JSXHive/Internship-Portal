import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    const deliverablesQuery = `
      SELECT 
        d.id,
        d.submission_id,
        d.user_id,
        d.submission_date,
        d.remarks,
        d.file_paths,
        d.status,
        d.feedback,
        d.reviewed_by,
        d.reviewed_at,
        d.created_at,
        d.updated_at,
        d.student_id,
        d.marks,
        u.name as reviewer_name
      FROM deliverables d
      LEFT JOIN users u ON d.reviewed_by = u.user_id
      WHERE d.user_id = $1 OR d.student_id = $1
      ORDER BY d.submission_date DESC
    `;
    
    const client = await pool.connect();
    try {
      const deliverablesResult = await client.query(deliverablesQuery, [studentId]);
      res.status(200).json(deliverablesResult.rows);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching deliverables:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}