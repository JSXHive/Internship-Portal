// pages/api/student/evaluation-submissions.js
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
        ts.submission_id,
        ts.task_id,
        ts.student_id,
        ts.submission_date,
        ts.remarks,
        ts.file_paths,
        ts.status,
        ts.marks,
        ts.mentor_feedback,
        ts.feedback_date,
        ts.reviewed_by,
        st.title as task_title,
        u.name as reviewer_name
      FROM task_submissions ts
      LEFT JOIN student_tasks st ON ts.task_id = st.task_id
      LEFT JOIN users u ON ts.reviewed_by = u.user_id
      WHERE ts.student_id = $1
      ORDER BY ts.submission_date DESC
    `;

    const result = await pool.query(query, [studentId]);
    
    console.log(`Found ${result.rows.length} task submissions for student ${studentId}`);
    
    // Log the structure of the first submission for debugging
    if (result.rows.length > 0) {
      console.log('Sample submission structure:', {
        submission_id: result.rows[0].submission_id,
        task_title: result.rows[0].task_title,
        file_paths: result.rows[0].file_paths,
        has_files: result.rows[0].file_paths && result.rows[0].file_paths.length > 0
      });
    }
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}