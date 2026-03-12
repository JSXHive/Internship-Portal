// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

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

    // Get all task queries for this mentor
    const query = `
      SELECT 
        tq.query_id,
        tq.task_id,
        tq.student_id,
        u.name as student_name,
        u.user_id as student_unique_id,
        tq.mentor_id,
        tq.subject,
        tq.message,
        tq.priority,
        tq.query_date,
        tq.status,
        tq.answer,
        tq.answer_date,
        st.title as task_title,
        mentor.name as mentor_name
      FROM task_queries tq
      INNER JOIN users u ON tq.student_id = u.user_id
      LEFT JOIN student_tasks st ON tq.task_id = st.task_id
      LEFT JOIN users mentor ON tq.mentor_id = mentor.user_id
      WHERE tq.mentor_id = $1
      ORDER BY tq.query_date DESC
    `;

    const result = await client.query(query, [mentorId]);
    client.release();

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching task queries:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}