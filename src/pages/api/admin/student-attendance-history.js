import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { studentId } = req.query;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const historyQuery = `
      SELECT 
        date,
        status,
        entry_time,
        exit_time,
        work_mode,
        is_late,
        is_early,
        note
      FROM attendance 
      WHERE user_id = $1 OR student_id = $1
      ORDER BY date DESC
      LIMIT 100
    `;

    const client = await pool.connect();
    try {
      const result = await client.query(historyQuery, [studentId]);
      
      const attendanceHistory = result.rows.map(row => ({
        date: row.date,
        status: row.status,
        entry_time: row.entry_time,
        exit_time: row.exit_time,
        work_mode: row.work_mode,
        is_late: row.is_late,
        is_early: row.is_early,
        note: row.note
      }));

      res.status(200).json({ attendance: attendanceHistory });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching student attendance history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}