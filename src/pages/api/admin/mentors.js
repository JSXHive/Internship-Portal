// Change from named import to default import
// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Check if pool is defined
      if (!pool) {
        console.error('Database pool is not defined');
        return res.status(500).json({ error: 'Database connection not established' });
      }
      
      // Test the connection first
      const client = await pool.connect();
      
      const result = await client.query(`
        SELECT 
          user_id,
          name,
          email,
          contact_no,
          designation,
          area_of_expertise,
          years_of_experience,
          bio,
          profile_photo,
          created_at,
          updated_at
        FROM mentor_profiles
        ORDER BY name
      `);
      
      client.release(); // Release the client back to the pool
      res.status(200).json({ mentors: result.rows });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to fetch mentors: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}