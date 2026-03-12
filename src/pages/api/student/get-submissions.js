// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    const client = await pool.connect();

    try {
      // Get all submissions for the student
      const submissionsQuery = `
        SELECT 
          ts.submission_id,
          ts.task_id,
          ts.student_id,
          ts.submission_date,
          ts.remarks,
          ts.file_paths,
          ts.status,
          ts.mentor_feedback,
          ts.feedback_date,
          ts.marks,
          ts.reviewed_by,
          ts.created_at,
          ts.updated_at,
          st.title as task_title,
          st.description as task_description,
          st.due_date,
          st.priority,
          st.category
        FROM task_submissions ts
        JOIN student_tasks st ON ts.task_id = st.task_id
        WHERE ts.student_id = $1
        ORDER BY ts.submission_date DESC
      `;

      const result = await client.query(submissionsQuery, [studentId]);
      
      // Transform the data to be keyed by task_id for easy lookup
      const submissionsByTask = {};
      result.rows.forEach(submission => {
        submissionsByTask[submission.task_id] = submission;
      });

      res.status(200).json({
        submissions: submissionsByTask,
        count: result.rows.length
      });

    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}