// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { mentor_name } = req.query;

      if (!mentor_name) {
        return res.status(400).json({ error: 'Mentor name is required' });
      }

      const client = await pool.connect();
      
      try {
        const result = await client.query(
          `SELECT user_id, name, email, contact_no, designation, 
                  area_of_expertise, years_of_experience, bio, profile_photo
           FROM mentor_profiles 
           WHERE name = $1`,
          [mentor_name]
        );

        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Mentor not found' });
        }

        res.json({ mentor: result.rows[0] });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error fetching mentor by name:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}