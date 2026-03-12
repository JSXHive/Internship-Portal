import { pool } from '../../../../lib/db';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // First get user details to find student_id
    const userQuery = 'SELECT student_id, name FROM users WHERE user_id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const studentId = userResult.rows[0].student_id;
    const userName = userResult.rows[0].name;

    if (!studentId) {
      return res.status(404).json({ error: 'Student ID not found for user' });
    }

    // Get only VERIFIED certificate for this student
    const certificateQuery = `
      SELECT 
        id,
        student_id,
        student_name,
        program_name,
        issue_date,
        certificate_id,
        verification_id,
        file_path,
        duration,
        domain,
        status,
        issued_by,
        issued_at,
        verified_by,
        verified_at,
        completion_date,
        created_at,
        updated_at
      FROM certificates 
      WHERE student_id = $1 AND status = 'verified'
      ORDER BY issued_at DESC 
      LIMIT 1
    `;

    const certificateResult = await pool.query(certificateQuery, [studentId]);

    if (certificateResult.rows.length === 0) {
      return res.status(404).json({ error: 'No verified certificate found' });
    }

    const certificate = certificateResult.rows[0];
    
    // Fix file path to be relative to public folder
    if (certificate.file_path && !certificate.file_path.startsWith('/')) {
      certificate.file_path = `/${certificate.file_path}`;
    }
    
    res.status(200).json(certificate);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}