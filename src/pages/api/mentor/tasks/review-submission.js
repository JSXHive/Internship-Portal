// /api/mentor/tasks/review-submission.js
// import { pool } from '../../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { submission_id, task_id, status, mentor_feedback, marks, reviewed_by } = req.body;

    if (!submission_id || !task_id || !reviewed_by) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID, Task ID, and Reviewer ID are required'
      });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Update task_submissions table
      const submissionUpdateQuery = `
        UPDATE task_submissions 
        SET status = $1, 
            mentor_feedback = $2, 
            marks = $3, 
            reviewed_by = $4, 
            feedback_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE submission_id = $5
        RETURNING *
      `;
      
      const submissionResult = await client.query(submissionUpdateQuery, [
        status, 
        mentor_feedback, 
        marks, 
        reviewed_by, 
        submission_id
      ]);

      if (submissionResult.rows.length === 0) {
        throw new Error('Submission not found');
      }

      // 2. Update student_tasks table based on review status
      let taskStatus = 'reviewed';
      if (status === 'rejected') {
        taskStatus = 'in-progress'; // Student needs to resubmit
      } else if (status === 'reviewed') {
        taskStatus = 'completed'; // Task is complete
      } else if (status === 'resubmitted') {
        taskStatus = 'submitted'; // Waiting for review again
      }

      const taskUpdateQuery = `
        UPDATE student_tasks 
        SET status = $1, 
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = $2
        RETURNING *
      `;
      
      const taskResult = await client.query(taskUpdateQuery, [taskStatus, task_id]);

      if (taskResult.rows.length === 0) {
        throw new Error('Task not found');
      }

      await client.query('COMMIT');

      res.status(200).json({ 
        success: true, 
        message: 'Submission reviewed successfully',
        data: {
          submission: submissionResult.rows[0],
          task: taskResult.rows[0]
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to review submission' 
    });
  }
}