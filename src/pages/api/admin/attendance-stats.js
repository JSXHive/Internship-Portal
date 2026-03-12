import { pool } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { startDate, endDate } = req.query;

  try {
    // Get overall statistics
    const totalStudentsResult = await pool.query(`
      SELECT COUNT(*) as total FROM users WHERE user_role = 'student'
    `);

    // Get today's attendance stats
    const todayStatsResult = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM attendance 
      WHERE date = CURRENT_DATE
      GROUP BY status
    `);

    // Get monthly attendance overview
    const monthlyStatsResult = await pool.query(`
      SELECT 
        DATE_TRUNC('week', date) as week,
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days
      FROM attendance 
      WHERE date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('week', date)
      ORDER BY week DESC
    `);

    // Get work mode distribution
    const workModeResult = await pool.query(`
      SELECT 
        work_mode,
        COUNT(*) as count
      FROM attendance 
      WHERE date = CURRENT_DATE AND work_mode IS NOT NULL
      GROUP BY work_mode
    `);

    const stats = {
      totalStudents: parseInt(totalStudentsResult.rows[0].total),
      todayStats: todayStatsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      monthlyOverview: monthlyStatsResult.rows,
      workModeDistribution: workModeResult.rows.reduce((acc, row) => {
        acc[row.work_mode] = parseInt(row.count);
        return acc;
      }, {})
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}