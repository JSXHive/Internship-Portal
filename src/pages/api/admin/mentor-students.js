// pages/api/admin/mentor-students.js
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { mentorId } = req.query;

    if (!mentorId) {
      return res.status(400).json({ message: 'Mentor ID is required' });
    }

    // Query to get students assigned to a specific mentor
    const query = `
      SELECT 
        u.user_id,
        u.student_id,
        sp.name,
        sp.email,
        sp.phone,
        sp.college,
        sp.branch,
        sp.year_of_study,
        sp.cgpa,
        sp.status as student_status,
        a.application_id,
        a.status as application_status,
        a.created_at as application_date
      FROM users u
      INNER JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      WHERE a.mentor = $1 OR sp.mentor = $1
      ORDER BY sp.name
    `;

    const result = await pool.query(query, [mentorId]);

    res.status(200).json({
      students: result.rows,
      mentorId: mentorId
    });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}