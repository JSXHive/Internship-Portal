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
    const tasksQuery = `
      SELECT * FROM student_tasks 
      WHERE assigned_to = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(tasksQuery, [studentId]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching student tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}