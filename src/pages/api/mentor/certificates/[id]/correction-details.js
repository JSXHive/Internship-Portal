// import { pool } from '../../../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT 
            an.id,
            an.certificate_id,
            an.student_id,
            an.student_name,
            an.certificate_number,
            an.mentor_id,
            an.mentor_name,
            an.message,
            an.status,
            an.admin_notes,
            an.resolved_at,
            an.created_at,
            an.updated_at
           FROM admin_notifications an
           WHERE an.certificate_id = $1
           ORDER BY an.created_at DESC
           LIMIT 1`,
          [id]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Correction details not found' });
        }

        res.json({ 
          correctionDetails: result.rows[0]
        });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching correction details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}