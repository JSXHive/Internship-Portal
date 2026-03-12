// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Get certificates for the student
    const certificates = await pool.query(
      `SELECT 
        c.id,
        c.certificate_id,
        c.program_name,
        c.issue_date,
        c.verification_id,
        c.file_path,
        c.duration,
        c.skills,
        c.created_at,
        CASE 
          WHEN c.file_path IS NOT NULL AND c.issue_date IS NOT NULL THEN 'issued'
          WHEN c.file_path IS NULL AND c.issue_date IS NOT NULL THEN 'pending'
          ELSE 'processing'
        END as status
       FROM certificates c
       WHERE c.user_id = $1
       ORDER BY c.issue_date DESC, c.created_at DESC`,
      [userId]
    );

    // Get student information from student_profiles table
    const studentInfo = await pool.query(
      `SELECT 
        u.name,
        u.email,
        u.user_id,
        u.student_id as student_number,
        sp.branch as department,
        sp.college as program,
        sp.phone,
        sp.college,
        sp.branch
       FROM users u
       LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      certificates: certificates.rows,
      studentInfo: studentInfo.rows[0] || {}
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}