import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    const statsQuery = `
      SELECT 
        -- Average task rating
        COALESCE(ROUND(AVG(ts.marks), 1), 0) as avg_rating,
        
        -- Total tasks count by status
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN st.status = 'completed' OR st.status = 'reviewed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN st.status = 'pending' OR st.status = 'in-progress' THEN 1 END) as pending_tasks,
        COUNT(CASE WHEN st.status = 'submitted' THEN 1 END) as submitted_tasks,
        
        -- On-time submission rate
        COUNT(CASE WHEN ts.submission_date IS NOT NULL AND st.due_date IS NOT NULL AND ts.submission_date <= st.due_date THEN 1 END) as on_time_submissions,
        COUNT(CASE WHEN ts.submission_date IS NOT NULL THEN 1 END) as total_submissions
        
      FROM student_tasks st
      LEFT JOIN task_submissions ts ON st.task_id = ts.task_id AND ts.student_id = $1
      WHERE st.assigned_to = $1
    `;

    const result = await pool.query(statsQuery, [studentId]);
    
    if (result.rows.length === 0) {
      return res.status(200).json({ 
        avg_rating: 0, 
        total_tasks: 0, 
        completed_tasks: 0, 
        pending_tasks: 0, 
        submitted_tasks: 0,
        on_time_submission_rate: 0
      });
    }

    const stats = result.rows[0];
    const onTimeRate = stats.total_submissions > 0 
      ? Math.round((stats.on_time_submissions / stats.total_submissions) * 100) 
      : 0;

    res.status(200).json({
      avg_rating: stats.avg_rating,
      total_tasks: stats.total_tasks,
      completed_tasks: stats.completed_tasks,
      pending_tasks: stats.pending_tasks,
      submitted_tasks: stats.submitted_tasks,
      on_time_submission_rate: onTimeRate
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}