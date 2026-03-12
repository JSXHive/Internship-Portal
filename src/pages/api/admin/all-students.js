// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        u.user_id,
        u.student_id,
        u.name,
        u.email,
        sp.college,
        sp.branch,
        sp.profile_photo,
        a.start_date,
        a.end_date
      FROM users u
      LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      WHERE u.user_role = 'student'
      ORDER BY u.name
    `);

    res.status(200).json({
      students: result.rows,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}