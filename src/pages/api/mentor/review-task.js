import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submission_id, mentor_feedback, marks, status, reviewed_by } = req.body;

  if (!submission_id || !reviewed_by) {
    return res.status(400).json({ error: 'Submission ID and reviewer ID are required' });
  }

  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update the task submission with review details
      const updateSubmissionQuery = `
        UPDATE task_submissions 
        SET mentor_feedback = $1, 
            marks = $2, 
            status = $3,
            reviewed_by = $4,
            feedback_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE submission_id = $5
        RETURNING *
      `;

      const submissionResult = await client.query(updateSubmissionQuery, [
        mentor_feedback,
        marks,
        status,
        reviewed_by,
        submission_id
      ]);

      if (submissionResult.rows.length === 0) {
        throw new Error('Submission not found');
      }

      // Update the corresponding task status to 'reviewed'
      const updateTaskQuery = `
        UPDATE student_tasks 
        SET status = 'reviewed',
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = (
          SELECT task_id FROM task_submissions WHERE submission_id = $1
        )
      `;

      await client.query(updateTaskQuery, [submission_id]);

      await client.query('COMMIT');

      res.status(200).json({ 
        message: 'Review submitted successfully',
        submission: submissionResult.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}