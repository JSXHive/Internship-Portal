import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ error: 'Mentor ID is required' });
  }

  try {
    const client = await pool.connect();

    // Get all task submissions for tasks assigned by this mentor
    const query = `
      SELECT 
        ts.submission_id,
        ts.task_id,
        ts.student_id,
        u.name as student_name,
        u.user_id as student_unique_id,
        ts.submission_date,
        ts.remarks,
        ts.file_paths,
        ts.status,
        ts.mentor_feedback,
        ts.marks,
        ts.reviewed_by,
        ts.feedback_date,
        st.title as task_title,
        st.description as task_description,
        st.assigned_by,
        mentor.name as mentor_name
      FROM task_submissions ts
      INNER JOIN student_tasks st ON ts.task_id = st.task_id
      INNER JOIN users u ON ts.student_id = u.user_id
      LEFT JOIN users mentor ON st.assigned_by = mentor.user_id
      WHERE st.assigned_by = $1
      ORDER BY ts.submission_date DESC
    `;

    const result = await client.query(query, [mentorId]);
    client.release();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching task submissions:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}