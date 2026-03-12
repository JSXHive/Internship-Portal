// /api/mentor/tasks/submission-details.js
import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { taskId } = req.query;

  if (!taskId) {
    return res.status(400).json({
      success: false,
      message: 'Task ID is required'
    });
  }

  try {
    const query = `
      SELECT 
        ts.*,
        st.title as task_title,
        st.description as task_description,
        st.due_date as task_due_date,
        student.name as student_name,
        student.email as student_email,
        reviewer.name as reviewer_name
      FROM task_submissions ts
      INNER JOIN student_tasks st ON ts.task_id = st.task_id
      INNER JOIN users student ON ts.student_id = student.user_id
      LEFT JOIN users reviewer ON ts.reviewed_by = reviewer.user_id
      WHERE ts.task_id = $1
      ORDER BY ts.submission_date DESC
    `;

    const result = await pool.query(query, [taskId]);
    
    res.status(200).json({
      success: true,
      submissions: result.rows
    });

  } catch (error) {
    console.error('Error fetching submission details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission details'
    });
  }
}