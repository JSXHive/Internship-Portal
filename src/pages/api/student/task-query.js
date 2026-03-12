// import { pool } from '../../../../lib/db'; // ✅ Fixed import
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { task_id, student_id, mentor_id, subject, message, priority, query_date } = req.body;

  if (!student_id || !subject || !message) {
    return res.status(400).json({ error: 'Student ID, subject, and message are required' });
  }

  try {
    // FIXED: Use PostgreSQL NOW() function for consistent timestamp handling
    const queryInsert = `
      INSERT INTO task_queries (
        task_id,
        student_id,
        mentor_id,
        subject,
        message,
        priority,
        query_date,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::timestamp, NOW()), 'open')
      RETURNING *
    `;

    const result = await pool.query(queryInsert, [
      task_id || null,
      student_id,
      mentor_id || null,
      subject,
      message,
      priority || 'medium',
      query_date || null // Let database handle timestamp if not provided
    ]);

    res.status(201).json({
      message: 'Query submitted successfully',
      query: result.rows[0]
    });

  } catch (error) {
    console.error('Error submitting query:', error);
    
    // More specific error handling
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Invalid task, student, or mentor ID' });
    }
    if (error.code === '22007') { // Invalid datetime format
      return res.status(400).json({ error: 'Invalid date format provided' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
}