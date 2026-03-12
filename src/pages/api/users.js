// import { pool } from '../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  try {
    // Query your PostgreSQL database for users
    const result = await pool.query(
      `SELECT user_id, name, email, user_role FROM public.users ORDER BY name`
    );

    return res.status(200).json({
      users: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}