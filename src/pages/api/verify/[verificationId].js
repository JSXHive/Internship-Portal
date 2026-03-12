// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { verificationId } = req.query;

  if (!verificationId) {
    return res.status(400).json({ message: 'Verification ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT 
        c.certificate_id,
        c.program_name,
        c.issue_date,
        c.duration,
        c.skills,
        c.file_path,
        u.name as student_name,
        u.email as student_email,
        u.student_id as student_number,
        sp.branch as department,
        sp.college as program
       FROM certificates c
       JOIN users u ON c.user_id = u.user_id
       LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
       WHERE c.verification_id = $1`,
      [verificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid verification ID'
      });
    }

    const certificate = result.rows[0];

    res.status(200).json({
      success: true,
      certificate: {
        certificateId: certificate.certificate_id,
        programName: certificate.program_name,
        issueDate: certificate.issue_date,
        duration: certificate.duration,
        skills: certificate.skills,
        studentName: certificate.student_name,
        studentEmail: certificate.student_email,
        studentNumber: certificate.student_number,
        department: certificate.department,
        program: certificate.program,
        filePath: certificate.file_path,
        isValid: true,
        verifiedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}