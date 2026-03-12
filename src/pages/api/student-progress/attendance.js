// import { pool } from '../../../../lib/db';
import { pool } from "@/lib/db";

export default async function handler(req, res) {
  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  try {
    const client = await pool.connect();
    try {
      // Get user_id from student_id (studentId is actually user_id from localStorage)
      const userQuery = `SELECT user_id FROM users WHERE user_id = $1`;
      const userResult = await client.query(userQuery, [studentId]);
      
      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = userResult.rows[0].user_id;

      // Calculate attendance percentage
      const attendanceQuery = `
        SELECT 
          COUNT(*) as total_days,
          COUNT(CASE WHEN status = 'present' THEN 1 END) as present_days,
          ROUND(
            (COUNT(CASE WHEN status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)
          ), 2) as percentage
        FROM attendance 
        WHERE user_id = $1
      `;
      
      const attendanceResult = await client.query(attendanceQuery, [userId]);
      
      const attendanceData = attendanceResult.rows[0] || {
        total_days: 0,
        present_days: 0,
        percentage: 0
      };

      res.status(200).json({
        totalDays: parseInt(attendanceData.total_days) || 0,
        presentDays: parseInt(attendanceData.present_days) || 0,
        percentage: parseFloat(attendanceData.percentage) || 0
      });
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}