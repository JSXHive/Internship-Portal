// pages/api/admin/correction-requests.js
import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pool.query(`
      SELECT 
        an.*,
        c.program_name,
        c.student_name,
        c.student_id,
        c.certificate_id,
        c.issue_date,
        c.file_path,
        sp.profile_photo,
        sp.college,
        sp.branch,
        sp.phone,
        u.email as student_email
      FROM admin_notifications an
      LEFT JOIN certificates c ON an.certificate_id = c.id
      LEFT JOIN student_profiles sp ON c.student_id = sp.user_id
      LEFT JOIN users u ON c.student_id = u.student_id
      ORDER BY an.created_at DESC
    `);

    res.status(200).json({
      correctionRequests: result.rows
    });
  } catch (error) {
    console.error('Error fetching correction requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}