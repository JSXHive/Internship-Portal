// pages/api/admin/correction-requests/[id].js
import { pool } from '../../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  try {
    const result = await pool.query(`
      SELECT 
        an.*,
        c.program_name,
        c.student_name,
        c.student_id,
        c.certificate_id,
        c.verification_id,
        c.issue_date,
        c.file_path,
        c.duration,
        c.domain,
        c.status as certificate_status,
        sp.profile_photo,
        sp.college,
        sp.branch,
        sp.phone,
        u.email as student_email,
        a.areas_of_interest,
        a.duration_months
      FROM admin_notifications an
      LEFT JOIN certificates c ON an.certificate_id = c.id
      LEFT JOIN student_profiles sp ON c.student_id = sp.user_id
      LEFT JOIN users u ON c.student_id = u.student_id
      LEFT JOIN applications a ON c.student_id = a.user_id
      WHERE an.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Correction request not found' });
    }

    res.status(200).json({
      correctionRequest: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching correction request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}