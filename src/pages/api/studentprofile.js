import { pool } from '../../../lib/db';

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
        sp.profile_photo,
        sp.name,
        u.email,
        sp.college,
        sp.branch
      FROM student_profiles sp
      INNER JOIN users u ON sp.user_id = u.user_id
      WHERE u.user_id = $1 OR u.student_id = $1
    `;

    const result = await pool.query(query, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}