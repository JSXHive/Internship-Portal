import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    // Debug: Check if pool is defined
    console.log('Pool object:', pool ? 'Defined' : 'Undefined');
    
    if (!pool || typeof pool.query !== 'function') {
      throw new Error('Database pool is not properly initialized');
    }

    // Get task submissions with task details and mentor information
    const query = `
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
        st.title,
        st.description,
        st.category,
        st.priority,
        st.due_date,
        st.assigned_by,
        u.name as reviewed_by_name
      FROM task_submissions ts
      INNER JOIN student_tasks st ON ts.task_id = st.task_id
      LEFT JOIN users u ON ts.reviewed_by = u.user_id
      WHERE ts.student_id = $1
      ORDER BY ts.submission_date DESC
    `;

    const result = await pool.query(query, [user_id]);

    // Format the data for frontend
    const formattedData = result.rows.map(row => ({
      ...row,
      file_paths: Array.isArray(row.file_paths) ? row.file_paths : [],
      submission_date: row.submission_date ? new Date(row.submission_date).toISOString() : null,
      feedback_date: row.feedback_date ? new Date(row.feedback_date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      due_date: row.due_date ? new Date(row.due_date).toISOString() : null
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });

  } catch (error) {
    console.error('Error fetching task history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}