import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    const tasksQuery = `
      SELECT 
        st.task_id,
        st.title,
        st.description,
        st.category,
        st.priority,
        st.status,
        st.due_date,
        st.estimated_hours,
        st.created_at,
        st.resources,
        u.name as assigned_by_name,
        -- Submission data (if exists)
        ts.submission_id,
        ts.submission_date,
        ts.remarks as submission_remarks,
        ts.file_paths,
        ts.status as submission_status,
        ts.mentor_feedback,
        ts.feedback_date,
        ts.marks,
        ts.reviewed_by,
        reviewer.name as reviewer_name
      FROM student_tasks st
      LEFT JOIN users u ON st.assigned_by = u.user_id
      LEFT JOIN task_submissions ts ON st.task_id = ts.task_id AND ts.student_id = $1
      LEFT JOIN users reviewer ON ts.reviewed_by = reviewer.user_id
      WHERE st.assigned_to = $1
      ORDER BY st.created_at DESC
    `;
    
    const client = await pool.connect();
    try {
      const tasksResult = await client.query(tasksQuery, [studentId]);
      res.status(200).json(tasksResult.rows);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}