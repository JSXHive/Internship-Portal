// import { pool } from '../../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      
      try {
        const query = `
          SELECT 
            c.id,
            c.student_id,
            c.student_name,
            c.program_name,
            c.issue_date,
            c.certificate_id,
            c.verification_id,
            c.file_path,
            c.duration,
            c.domain,
            c.status,
            c.issued_by,
            c.issued_at,
            c.verified_by,
            c.verified_at,
            c.created_at,
            c.updated_at,
            c.completion_date,
            u.email as student_email,
            sp.college,
            sp.branch,
            sp.profile_photo
          FROM certificates c
          LEFT JOIN users u ON c.student_id = u.student_id
          LEFT JOIN student_profiles sp ON u.user_id = sp.user_id
          WHERE c.id = $1
        `;

        const result = await client.query(query, [id]);

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Certificate not found' });
        }

        res.json({ 
          certificate: result.rows[0]
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching certificate details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}