// pages/api/student/evaluation-queries.js
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

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
        q.*,
        t.title as task_title
      FROM task_queries q
      LEFT JOIN student_tasks t ON q.task_id = t.task_id
      WHERE q.student_id = $1
      ORDER BY q.query_date DESC
    `;

    const result = await pool.query(query, [studentId]);
    
    res.status(200).json(result.rows); // Return as array directly
  } catch (error) {
    console.error('Error fetching task queries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}