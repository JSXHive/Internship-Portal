import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const query = `
      SELECT DISTINCT
        u.student_id,
        sp.name,
        sp.profile_photo,
        sp.college,
        sp.branch,
        sp.email,
        a.areas_of_interest,
        a.duration_months,
        sp.status as student_status
      FROM users u
      INNER JOIN student_profiles sp ON u.user_id = sp.user_id
      LEFT JOIN applications a ON u.user_id = a.user_id
      WHERE u.user_role = 'student' 
        AND sp.status = 'completed'
        AND NOT EXISTS (
          SELECT 1 FROM certificates c 
          WHERE c.student_id = u.student_id 
          AND c.status != 'rejected'
        )
      ORDER BY sp.name
    `;

    const result = await pool.query(query);
    
    res.status(200).json({
      success: true,
      students: result.rows
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}