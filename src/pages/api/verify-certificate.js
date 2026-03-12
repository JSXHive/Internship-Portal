import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  const { id, name } = req.query;

  if (!id || !name) {
    return res.status(400).json({ error: 'ID and name are required' });
  }

  try {
    const result = await pool.query(
      `SELECT c.*, u.name as student_name, u.email 
       FROM certificates c
       JOIN public.users u ON c.user_id = u.user_id
       WHERE c.user_id = $1 AND u.name ILIKE $2`,
      [id, `%${name}%`]
    );

    if (result.rows.length > 0) {
      const certificate = result.rows[0];
      
      return res.status(200).json({
        exists: true,
        certificate: {
          studentName: certificate.student_name,
          programName: certificate.program_name,
          issueDate: new Date(certificate.issue_date).toLocaleDateString(),
          certificateId: certificate.certificate_id,
          duration: certificate.duration,
          skills: certificate.skills,
          filePath: certificate.file_path
        }
      });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
