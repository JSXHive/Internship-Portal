import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  try {
    const mentorId = req.query.mentorId;
    if (!mentorId) {
      console.error('Mentor students API error: mentorId missing');
      return res.status(400).json({ error: 'mentorId query parameter is required' });
    }
    
    const result = await pool.query(
      `SELECT sp.*, a.status as application_status 
       FROM student_profiles sp 
       JOIN applications a ON sp.email = a.email 
       WHERE sp.status = 'active' AND sp.mentor = $1`,
      [mentorId]
    );
    
    res.status(200).json({ students: result.rows });
  } catch (err) {
    console.error('Mentor students API error:', err);
    res.status(500).json({ error: 'Failed to fetch students', details: err.message });
  }
}