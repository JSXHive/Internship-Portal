// import { pool } from "../../../../lib/db";
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { mentorId } = req.query;

  try {
    const query = `
      SELECT 
        sp.*,
        a.areas_of_interest,
        a.duration_months,
        a.start_date,
        a.end_date,
        a.resume_url as application_resume,
        a.status as application_status,
        m.name as mentor_name,
        m.email as mentor_email
      FROM student_profiles sp
      LEFT JOIN applications a ON sp.user_id = a.user_id
      LEFT JOIN mentors m ON sp.mentor = m.user_id
      WHERE sp.mentor = $1
      ORDER BY sp.name
    `;

    const result = await pool.query(query, [mentorId]);
    
    res.status(200).json({ students: result.rows });
  } catch (error) {
    console.error('Error fetching mentor students:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}