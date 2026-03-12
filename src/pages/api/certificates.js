// pages/api/certificates.js
// import  { pool }  from '../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  try {
    // This is a placeholder - you'll need to create a certificates table
    const result = await pool.query('SELECT * FROM certificates');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    // Return empty array if table doesn't exist yet
    res.status(200).json([]);
  }
}