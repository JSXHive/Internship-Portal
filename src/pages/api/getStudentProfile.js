// pages/api/getStudentProfile.js (alternative version)
// import { pool } from '../../../lib/db';
import { pool } from "@/lib/db";


export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  const { email } = req.query;


  if (!email) {
    return res.status(405).json({ error: 'Email parameter is required' });
  }


  try {
    const client = await pool.connect();
   
    // First, get all column names from the table
    const columnsResult = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'student_profiles'
      ORDER BY ordinal_position
    `);
   
    const columnNames = columnsResult.rows.map(row => row.column_name);
   
    // Build the SELECT query dynamically
    const selectClause = columnNames.map(col => {
      // Map any column name differences here
      const mappings = {
        'ggpa': 'cgpa', // If ggpa exists but should be called cgpa in response
        'cgpa': 'cgpa', // If cgpa exists
        'profile_id': 'id'
      };
     
      const outputName = mappings[col] || col;
      return outputName === col ? col : `${col} as ${outputName}`;
    }).join(', ');
   
    // Execute the query with dynamic columns
    const result = await client.query(
      `SELECT ${selectClause} FROM student_profiles WHERE email = $1`,
      [email]
    );
   
    client.release();


    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student profile not found' });
    }


    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}