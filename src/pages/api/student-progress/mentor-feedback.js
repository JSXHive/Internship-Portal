import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  const client = await pool.connect();
  try {
    // Get task submissions feedback
    const taskFeedbackQuery = `
      SELECT 
        ts.submission_id,
        ts.task_id,
        ts.student_id,
        ts.submission_date,
        ts.remarks,
        ts.file_paths,
        ts.status,
        ts.mentor_feedback,
        ts.feedback_date as reviewed_at,
        ts.marks,
        ts.reviewed_by,
        st.title as task_title,
        st.description as task_description,
        u.name as reviewer_name,
        'task' as feedback_type
      FROM task_submissions ts
      JOIN student_tasks st ON ts.task_id = st.task_id
      LEFT JOIN users u ON ts.reviewed_by = u.user_id
      WHERE ts.student_id = $1 
        AND ts.mentor_feedback IS NOT NULL
        AND ts.feedback_date IS NOT NULL
    `;

    // Get deliverables feedback
    const deliverablesFeedbackQuery = `
      SELECT 
        d.id,
        d.submission_id,
        d.user_id as student_id,
        d.submission_date,
        d.remarks,
        d.file_paths,
        d.status,
        d.feedback as mentor_feedback,
        d.reviewed_at,
        d.marks,
        d.reviewed_by,
        CONCAT('Deliverable - ', d.submission_id) as task_title,
        d.remarks as task_description,
        u.name as reviewer_name,
        'deliverable' as feedback_type
      FROM deliverables d
      LEFT JOIN users u ON d.reviewed_by = u.user_id
      WHERE (d.user_id = $1 OR d.student_id = $1)
        AND d.feedback IS NOT NULL
        AND d.reviewed_at IS NOT NULL
    `;

    const [taskFeedbackResult, deliverablesFeedbackResult] = await Promise.all([
      client.query(taskFeedbackQuery, [studentId]),
      client.query(deliverablesFeedbackQuery, [studentId])
    ]);

    // Combine and format the results
    const combinedFeedback = [
      ...taskFeedbackResult.rows,
      ...deliverablesFeedbackResult.rows
    ]
    .sort((a, b) => new Date(b.reviewed_at) - new Date(a.reviewed_at))
    .map(row => ({
      submission_id: row.submission_id,
      task_id: row.task_id || row.id,
      student_id: row.student_id,
      submission_date: row.submission_date,
      remarks: row.remarks,
      file_paths: row.file_paths,
      status: row.status,
      mentor_feedback: row.mentor_feedback,
      reviewed_at: row.reviewed_at,
      marks: row.marks,
      reviewed_by: row.reviewed_by,
      task_title: row.task_title,
      task_description: row.task_description,
      reviewer_name: row.reviewer_name,
      feedback_type: row.feedback_type
    }));

    res.status(200).json(combinedFeedback);
  } catch (error) {
    console.error('Error fetching mentor feedback:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  } finally {
    client.release();
  }
}