// pages/api/mentor/students.js
import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  if (!mentorId) {
    return res.status(400).json({ message: 'mentorId missing' });
  }

  try {
    // Get students allocated to this mentor from applications table
    const query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.student_id,
        a.college,
        a.branch,
        a.year_of_study,
        a.cgpa,
        a.areas_of_interest,
        a.application_status
      FROM applications a
      INNER JOIN users u ON a.user_id = u.user_id
      WHERE a.mentor = $1 AND u.user_role = 'student'
      ORDER BY u.name
    `;

    const { rows } = await pool.query(query, [mentorId]);
    
    res.status(200).json({
      students: rows,
      count: rows.length
    });

  } catch (error) {
    console.error('Error fetching mentor students:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}