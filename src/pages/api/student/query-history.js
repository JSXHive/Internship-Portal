// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

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

    // Get task queries with task details
    const query = `
      SELECT 
        tq.query_id,
        tq.task_id,
        tq.student_id,
        tq.mentor_id,
        tq.subject,
        tq.message,
        tq.priority,
        tq.query_date,
        tq.status,
        tq.answer,
        tq.answer_date,
        tq.created_at,
        tq.updated_at,
        st.title,
        st.category,
        u.name as mentor_name
      FROM task_queries tq
      INNER JOIN student_tasks st ON tq.task_id = st.task_id
      LEFT JOIN users u ON tq.mentor_id = u.user_id
      WHERE tq.student_id = $1
      ORDER BY tq.query_date DESC
    `;

    const result = await pool.query(query, [user_id]);

    // Format the data for frontend
    const formattedData = result.rows.map(row => ({
      ...row,
      query_date: row.query_date ? new Date(row.query_date).toISOString() : null,
      answer_date: row.answer_date ? new Date(row.answer_date).toISOString() : null,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
      count: formattedData.length
    });

  } catch (error) {
    console.error('Error fetching query history:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}