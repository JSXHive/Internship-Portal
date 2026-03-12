// pages/api/student/queries.js
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentId } = req.query;

  // Validate studentId
  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT 
        q.query_id,
        q.task_id,
        t.title as task_title,
        q.subject,
        q.message,
        q.priority,
        q.query_date,
        q.status,
        q.answer,
        q.answer_date,
        u.name as mentor_name
      FROM task_queries q
      LEFT JOIN student_tasks t ON q.task_id = t.task_id
      LEFT JOIN users u ON q.mentor_id = u.user_id
      WHERE q.student_id = $1
      ORDER BY q.query_date DESC`,
      [studentId]
    );

    res.status(200).json({ queries: result.rows });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}