// pages/api/debugTable.js
import { pool } from '../../../lib/db';

export default async function handler(req, res) {
  try {
    const client = await pool.connect();
    
    // Get table structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'student_profiles'
      ORDER BY ordinal_position
    `);
    
    // Get sample data
    const sampleData = await client.query(`
      SELECT * FROM student_profiles LIMIT 1
    `);
    
    client.release();

    res.status(200).json({
      tableStructure: tableInfo.rows,
      sampleData: sampleData.rows[0] || {}
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
}