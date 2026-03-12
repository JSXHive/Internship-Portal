// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get students who have completed internships (status = 'completed' in applications)
      const query = `
        SELECT DISTINCT
          u.user_id,
          u.student_id,
          u.name,
          u.email,
          sp.college,
          sp.branch,
          sp.profile_photo,
          a.start_date,
          a.end_date,
          a.duration_months,
          a.areas_of_interest
        FROM users u
        LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
        LEFT JOIN applications a ON u.user_id = a.user_id
        WHERE u.user_role = 'student'
          AND a.status = 'completed'
        ORDER BY u.name
      `;

      const result = await pool.query(query);
      res.status(200).json({ students: result.rows });
    } catch (error) {
      console.error('Error fetching completed students:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}